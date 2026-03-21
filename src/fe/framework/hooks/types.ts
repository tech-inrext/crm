export interface MutationOptions<TPayload, TResponse> {
  /** Override the URL for this specific call (falls back to hook-level URL). */
  url?: string;
  /** Called on successful response. */
  onSuccess?: (data: TResponse, payload: TPayload) => void;
  /** Called when all retry attempts have been exhausted. */
  onError?: (error: MutationError) => void;
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
}
