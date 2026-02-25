import { useState, useCallback } from "react";
import axios, { AxiosRequestConfig, Method } from "axios";

export interface MutationOptions<TPayload, TResponse> {
    onSuccess?: (data: TResponse, payload: TPayload) => void;
    onError?: (error: string) => void;
}

export interface UseMutationState<TPayload, TResponse> {
    mutate: (payload: TPayload, options?: MutationOptions<TPayload, TResponse>) => Promise<void>;
    loading: boolean;
    error: string | null;
    data: TResponse | null;
    reset: () => void;
}

/**
 * useMutation – generic hook for POST / PATCH / DELETE calls.
 *
 * @example
 *  const { mutate, loading } = useMutation<UserFormData, ApiResponse>("/api/v0/employee");
 *  mutate(formData, { onSuccess: () => refetch() });
 */
function useMutation<TPayload = unknown, TResponse = unknown>(
    url: string,
    method: Extract<Method, "post" | "patch" | "put" | "delete"> = "post",
    requestConfig?: AxiosRequestConfig,
): UseMutationState<TPayload, TResponse> {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<TResponse | null>(null);

    const reset = useCallback(() => { setError(null); setData(null); }, []);

    const mutate = useCallback(async (payload: TPayload, options?: MutationOptions<TPayload, TResponse>) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.request<TResponse>({ url, method, data: payload, ...requestConfig });
            setData(response.data);
            options?.onSuccess?.(response.data, payload);
        } catch (err) {
            const message = axios.isAxiosError(err)
                ? err.response?.data?.message ?? err.message
                : "An unexpected error occurred";
            setError(message);
            options?.onError?.(message);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, method]);

    return { mutate, loading, error, data, reset };
}

export default useMutation;
