import axios from "axios";
import { useState, useCallback, useEffect, useMemo } from "react";
import { buildCacheKey } from "./helpers";
import queryCache from "./cache";
import useMutation from "./createMutation";

const CACHE_TTL_MS = 30_000; // 30 seconds

const useQuery = (
  getConfig: (params: Record<string, unknown>) => {
    url: string;
    isPaginated: boolean;
    defaultPageSize: number;
    shouldCache: true;
  },
  params = {},
) => {
  const config = useMemo(() => getConfig(params), [params]);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Start as true to show skeleton on initial render
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(config.defaultPageSize || 10);

  const serializedParams = JSON.stringify(params);

  const getRequestParams = () => {
    if (config.isPaginated) {
    const pageToUse = params.page !== undefined ? params.page : page;
    const rowsPerPageToUse = params.rowsPerPage !== undefined ? params.rowsPerPage : rowsPerPage;
      return { ...params, page: pageToUse, rowsPerPage: rowsPerPageToUse };
    }
    return params;
  };

  const fetchData = useCallback(
    async (params, forceRefresh = false) => {
      if (!forceRefresh && config.shouldCache) {
        const cacheKey = buildCacheKey(config.url, params);

        const cached = queryCache.get(cacheKey);
        // If has cache and not expired
        if (cached) {
          setData(cached.data);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      try {
        const response = await axios.get(config.url, {
          params,
        });
        setData(response.data);

        // Store in cache
        if (config.shouldCache) {
          const cacheKey = buildCacheKey(config.url, params);
          queryCache.set(cacheKey, response, CACHE_TTL_MS);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const goToPage = (newPage: number) => {
    setPage(newPage);
  };

  const setPageSize = (size: number) => {
    setRowsPerPage(size);
  };

  
  useEffect(
    () => {
      const params = getRequestParams();
      // Automatic queries can use cache
      fetchData(params, false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.url, serializedParams, page, rowsPerPage],
  );

  // Parse items (handle both { data: [], pagination: {} } and direct arrays)
  const items = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : [];

  // Parse pagination metadata
  const totalItems = data?.pagination?.totalItems ?? 0;

  // Wrapper for refetch that forces refresh
  const refetch = useCallback(() => {
    const params = getRequestParams();
    return fetchData(params, true); // Force refresh when called explicitly
  }, [getRequestParams, fetchData]);

  return {
    items,
    data, // Keep raw data for edge cases
    error,
    loading,
    page,
    rowsPerPage,
    totalItems,
    refetch,
    setPage: goToPage,
    setPageSize,
  };
};

const createApi = ({
  endpoints,
  mutations,
}: {
  endpoints: Record<
    string,
    (params: Record<string, unknown>) => {
      url: string;
      isPaginated: boolean;
      defaultPageSize?: number;
    }
  >;
  mutations: Record<
    string,
    (params: Record<string, unknown>) => {
      url: string;
      isPaginated: boolean;
      defaultPageSize?: number;
    }
  >;
}) => {
  const hooks = {};

  Object.entries(endpoints).forEach(([key, value]) => {
    const hookName = `use${key.charAt(0).toUpperCase() + key.slice(1)}Query`;
    hooks[hookName] = useQuery.bind(null, value);
  });
  Object.entries(mutations).forEach(([key, value]) => {
    const hookName = `use${key.charAt(0).toUpperCase() + key.slice(1)}Mutation`;
    hooks[hookName] = useMutation.bind(null, value);
  });

  return hooks;
};

// Export cache invalidation function for use by mutations
export function invalidateQueryCache(urlPrefix: string): void {
  queryCache.invalidate(urlPrefix);
}

export default createApi;
