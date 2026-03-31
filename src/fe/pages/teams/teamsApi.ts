import createApi from "@/fe/framework/hooks/createApi";

const teamsApi = createApi({
  endpoints: {
    getHierarchy: () => ({
      url: "/api/v0/employee/hierarchy",
      isPaginated: false,
      shouldCache: true,
    }),
  },
});

export const { useGetHierarchyQuery } = teamsApi;
