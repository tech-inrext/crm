import { useState, useEffect, useCallback, useRef } from "react";
import axios, { AxiosRequestConfig } from "axios";

export interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * useApi – generic data-fetching hook for GET requests.
 *
 * @param url - endpoint to fetch (pass `null` to skip fetching)
 * @param config - optional AxiosRequestConfig (params, headers, etc.)
 * @param deps - extra dependencies that trigger a refetch
 *
 * @example
 *  const { data, loading, error, refetch } = useApi<User[]>("/api/v0/employee");
 */
function useApi<T = unknown>(
    url: string | null,
    config?: AxiosRequestConfig,
    deps: unknown[] = [],
): UseApiState<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const configRef = useRef(config);

    const fetchData = useCallback(async () => {
        if (!url) return;
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<T>(url, configRef.current);
            setData(response.data);
        } catch (err) {
            const message = axios.isAxiosError(err)
                ? err.response?.data?.message ?? err.message
                : "An unexpected error occurred";
            setError(message);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, ...deps]);

    useEffect(() => { fetchData(); }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}

export default useApi;
