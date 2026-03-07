import { useState, useCallback, useRef, useEffect } from "react";
import axios, {
  AxiosRequestConfig,
  AxiosError,
  Method,
  CancelTokenSource,
} from "axios";
import { invalidateQueryCache } from "./createApi";

// ─── Module-level cache (shared across all instances) ──────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/** Keys: `url::serialisedPayload`. Values: cached response + timestamp. */
const mutationCache = new Map<string, CacheEntry<unknown>>();

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1_000;

function isCacheValid(entry: CacheEntry<unknown>, ttlMs: number): boolean {
  return Date.now() - entry.timestamp < ttlMs;
}

/**
 * Purges every cache entry whose key starts with `urlPrefix`.
 * Call after a successful mutation to invalidate related query caches.
 */
export function invalidateCacheByPrefix(urlPrefix: string): void {
  for (const key of mutationCache.keys()) {
    if (key.startsWith(urlPrefix)) mutationCache.delete(key);
  }
}

// ─────────────────────────────────────────────
//  Hook types
// ─────────────────────────────────────────────

export interface MutationOptions<TPayload, TResponse> {
  /** Override the URL for this specific call (falls back to hook-level URL). */
  url?: string;
  /** Called on successful response. */
  onSuccess?: (data: TResponse, payload: TPayload) => void;
  /** Called when all retry attempts have been exhausted. */
  onError?: (error: MutationError) => void;
  /**
   * URL prefix(es) whose cache entries should be invalidated after success.
   * Defaults to the request URL itself.
   */
  invalidateKeys?: string[];
  /** Override retry count for this specific call. */
  retries?: number;
  /** Override cache TTL (ms) for reading a cached response. */
  cacheTtlMs?: number;
  /** If true, skip cache lookup and always hit the network. */
  forceRefresh?: boolean;
  /**
   * Optional callback to refetch data after a successful mutation.
   * Automatically called after cache invalidation and onSuccess.
   */
  refetch?: () => Promise<void> | void;
}

export interface MutationError {
  message: string;
  status?: number;
  raw?: unknown;
}

export interface UseMutationState<TPayload, TResponse> {
  mutate: (
    payload: TPayload,
    options?: MutationOptions<TPayload, TResponse>,
  ) => Promise<TResponse>;
  /** Abort an in-flight request. */
  abort: () => void;
  loading: boolean;
  error: MutationError | null;
  data: TResponse | null;
  /** How many retry attempts occurred on the last call. */
  retryCount: number;
  reset: () => void;
}

export interface UseMutationConfig {
  /** Maximum retry attempts for 5xx / network errors. Default: 2 */
  maxRetries?: number;
  /** Initial back-off delay in ms (doubled each attempt). Default: 300 */
  retryDelayMs?: number;
  /** Cache TTL in ms for storing a successful response. Default: 5 min */
  cacheTtlMs?: number;
  /**
   * When true, the successful response is stored in the cache under
   * the request URL key. Default: false (mutations are not cached by default;
   * set to true only for idempotent mutations like read-through PUT endpoints).
   */
  cacheResponse?: boolean;
}

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

/** Builds a deterministic cache key from URL + serialised payload. */
function buildCacheKey(url: string, payload: unknown): string {
  try {
    return `${url}::${JSON.stringify(payload)}`;
  } catch {
    return url;
  }
}

/** Returns true for error codes that are worth retrying (transient). */
function isRetryable(err: unknown): boolean {
  if (err instanceof AxiosError) {
    const status = err.response?.status;
    // Retry on network errors (no response) or 5xx server errors
    return status === undefined || (status >= 500 && status < 600);
  }
  return false;
}

/** Async sleep helper. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────

function useMutation<TPayload = unknown, TResponse = unknown>(
  url: string,
  method: Extract<Method, "post" | "patch" | "put" | "delete"> = "post",
  requestConfig?: AxiosRequestConfig,
  hookConfig?: UseMutationConfig,
): UseMutationState<TPayload, TResponse> {
  const {
    maxRetries = 2,
    retryDelayMs = 300,
    cacheTtlMs: hookCacheTtlMs = DEFAULT_CACHE_TTL_MS,
    cacheResponse = false,
  } = hookConfig ?? {};

  // Stable ref so mutate() always reads the latest requestConfig
  // without needing it as a useCallback dep (avoids stale closures).
  const requestConfigRef = useRef(requestConfig);
  useEffect(() => {
    requestConfigRef.current = requestConfig;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<MutationError | null>(null);
  const [data, setData] = useState<TResponse | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Track whether the component is still mounted to guard stale state updates
  const mountedRef = useRef(true);
  // CancelTokenSource for aborting the in-flight axios request
  const cancelSourceRef = useRef<CancelTokenSource | null>(null);
  // Deduplication: set of cache keys that are currently in-flight
  const inFlightRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelSourceRef.current?.cancel("Component unmounted");
    };
  }, []);

  /** Imperatively abort the current in-flight request. */
  const abort = useCallback(() => {
    cancelSourceRef.current?.cancel("Aborted by caller");
  }, []);

  const reset = useCallback(() => {
    if (!mountedRef.current) return;
    setData(null);
    setError(null);
    setLoading(false);
    setRetryCount(0);
  }, []);

  const mutate = useCallback(
    async (
      payload: TPayload,
      options?: MutationOptions<TPayload, TResponse>,
    ): Promise<TResponse> => {
      const resolvedUrl = options?.url ?? url;
      const resolvedMaxRetries = options?.retries ?? maxRetries;
      const resolvedCacheTtlMs = options?.cacheTtlMs ?? hookCacheTtlMs;
      const cacheKey = buildCacheKey(resolvedUrl, payload);

      // ── Deduplication guard ──────────────────────────────────────────────
      if (inFlightRef.current.has(cacheKey)) {
        // Silent no-op: the same request is already in-flight
        return Promise.reject(new Error("Duplicate request in-flight"));
      }

      // ── Cache read (opt-in, with TTL check) ──────────────────────────────
      if (!options?.forceRefresh && cacheResponse) {
        const cached = mutationCache.get(cacheKey) as
          | CacheEntry<TResponse>
          | undefined;
        if (cached && isCacheValid(cached, resolvedCacheTtlMs)) {
          if (mountedRef.current) {
            setData(cached.data);
            setLoading(false);
          }
          options?.onSuccess?.(cached.data, payload);
          return cached.data;
        }
      }

      // ── Setup ────────────────────────────────────────────────────────────
      inFlightRef.current.add(cacheKey);
      cancelSourceRef.current = axios.CancelToken.source();

      if (mountedRef.current) {
        setLoading(true);
        setError(null);
        setRetryCount(0);
      }

      let attempt = 0;
      let lastError: MutationError = { message: "Unknown error" };

      while (attempt <= resolvedMaxRetries) {
        try {
          const response = await axios.request<TResponse>({
            url: resolvedUrl,
            method,
            data: payload,
            cancelToken: cancelSourceRef.current.token,
            ...requestConfigRef.current,
          });

          const responseData = response.data;

          // ── Cache write ────────────────────────────────────────────────
          if (cacheResponse) {
            mutationCache.set(cacheKey, {
              data: responseData,
              timestamp: Date.now(),
            });
          }

          // ── Cache invalidation ──────────────────────────────────────────
          // Invalidate provided keys, or default to the resolved URL prefix
          const keysToInvalidate = options?.invalidateKeys ?? [resolvedUrl];
          keysToInvalidate.forEach((key) => {
            invalidateCacheByPrefix(key); // Invalidate mutation cache
            invalidateQueryCache(key); // Invalidate query cache
          });

          if (mountedRef.current) {
            setData(responseData);
            setLoading(false);
          }

          inFlightRef.current.delete(cacheKey);
          options?.onSuccess?.(responseData, payload);
          // Refetch data if a refetch callback was provided
          if (options?.refetch) {
            await options.refetch();
          }
          return responseData;
        } catch (err) {
          if (axios.isCancel(err)) {
            inFlightRef.current.delete(cacheKey);
            if (mountedRef.current) setLoading(false);
            throw err; // Don't retry on explicit cancellation
          }

          const axiosErr = err as AxiosError<{ message?: string }>;
          lastError = {
            message:
              axiosErr.response?.data?.message ??
              (err instanceof Error
                ? err.message
                : "An unknown error occurred"),
            status: axiosErr.response?.status,
            raw: err,
          };

          if (attempt < resolvedMaxRetries && isRetryable(err)) {
            // Exponential back-off: 300 → 600 → 1200 ms …
            const delay = retryDelayMs * Math.pow(2, attempt);
            attempt++;
            if (mountedRef.current) setRetryCount(attempt);
            await sleep(delay);
            continue;
          }
          // All attempts exhausted
          break;
        }
      }

      inFlightRef.current.delete(cacheKey);
      if (mountedRef.current) {
        setError(lastError);
        setLoading(false);
      }
      options?.onError?.(lastError);
      throw lastError;
    },
    [url, method, maxRetries, retryDelayMs, hookCacheTtlMs, cacheResponse],
  );

  return { mutate, abort, loading, error, data, retryCount, reset };
}

export default useMutation;
