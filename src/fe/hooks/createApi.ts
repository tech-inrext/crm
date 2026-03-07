import axios from "axios";
import { useState, useCallback, useEffect, useMemo } from "react";

// Query cache: stores GET request responses
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 30_000; // 30 seconds

function buildCacheKey(url: string, params: any): string {
  return `${url}::${JSON.stringify(params)}`;
}

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
      return { ...params, page, rowsPerPage };
    }
    return params;
  };

  const fetchData = useCallback(
    async (params, forceRefresh = false) => {
      const cacheKey = buildCacheKey(config.url, params);

      // Check cache first (unless force refresh)
      if (!forceRefresh && config.shouldCache) {
        const cached = queryCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
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
          queryCache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now(),
          });
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
}: {
  endpoints: Record<
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

  return hooks;
};

// Export cache invalidation function for use by mutations
export function invalidateQueryCache(urlPrefix: string): void {
  for (const key of queryCache.keys()) {
    if (key.startsWith(urlPrefix)) {
      queryCache.delete(key);
    }
  }
}

export default createApi;
