import axios from "axios";
import { useState, useCallback, useEffect, useMemo } from "react";

const useQuery = (
  getConfig: (params: Record<string, unknown>) => {
    url: string;
    isPaginated: boolean;
    defaultPageSize: number;
  },
  params = {}
) => {
  const config = useMemo(() => getConfig(params), [params]);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
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
    async () => {
      setLoading(true);
      try {
        const response = await axios.get(config.url, {
          params: getRequestParams(),
        });
        setData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const goToPage = (newPage: number) => {
    setPage(newPage);
  };

  const setPageSize = (size: number) => {
    setRowsPerPage(size);
  };

  useEffect(
    () => {
      fetchData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.url, serializedParams, page, rowsPerPage]
  );

  return {
    data,
    error,
    loading,
    page,
    rowsPerPage,
    refetch: fetchData,
    goToPage,
    setPageSize,
  };
};

const createApi = ({
  baseUrl,
  endpoints,
}: {
  baseUrl: string;
  endpoints: Record<
    string,
    (params: Record<string, unknown>) => {
      url: string;
      isPaginated: boolean;
      defaultPageSize?: number;
    }
  >;
  defaultPageSize?: number;
}) => {
  const hooks = {};

  Object.entries(endpoints).forEach(([key, value]) => {
    const hookName = `use${key.charAt(0).toUpperCase() + key.slice(1)}Query`;
    hooks[hookName] = useQuery.bind(null, value);
  });

  return hooks;
};

export default createApi;
