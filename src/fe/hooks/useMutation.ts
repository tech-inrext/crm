import { useState, useCallback, useRef, useEffect } from "react";
import axios, {
  AxiosRequestConfig,
  AxiosError,
  Method,
  CancelTokenSource,
} from "axios";
import { invalidateQueryCache } from "./createApi";
import { MutationOptions, MutationError, UseMutationState } from "./types";

function useMutation<TPayload = unknown, TResponse = unknown>(
  getConfig: (params: Record<string, unknown>) => {
    url: string;
    method: "post" | "patch" | "put" | "delete";
  },
): UseMutationState<TPayload, TResponse> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<MutationError | null>(null);
  const [data, setData] = useState<TResponse | null>(null);

  // CancelTokenSource for aborting the in-flight axios request
  const cancelSourceRef = useRef<CancelTokenSource | null>(null);

  /** Imperatively abort the current in-flight request. */
  const abort = useCallback(() => {
    cancelSourceRef.current?.cancel("Aborted by caller");
  }, []);

  const resetState = () => {
    setLoading(false);
    setError(null);
    setData(null);
  };

  const mutate = useCallback(
    async (body: TPayload, onSuccess): Promise<TResponse> => {
      const { url, method } = getConfig(body);
      console.log("Inside mutate");

      // ── Setup ────────────────────────────────────────────────────────────
      cancelSourceRef.current = axios.CancelToken.source();

      setLoading(true);
      setError(null);
      setData(null);

      try {
        const response = await axios.request<TResponse>({
          url,
          method,
          data: body,
          cancelToken: cancelSourceRef.current.token,
        });

        const responseData = response.data;

        setData(responseData);
        if (onSuccess) {
          await onSuccess(responseData, body);
        }
        return responseData;
      } catch (err) {
        const axiosErr = err as AxiosError<{ message?: string }>;
        let error = {
          message:
            axiosErr.response?.data?.message ??
            (err instanceof Error ? err.message : "An unknown error occurred"),
          status: axiosErr.response?.status,
          raw: err,
        };
        console.log("Here is error", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { mutate, abort, loading, error, data };
}

export default useMutation;
