import createApi from "@/fe/framework/hooks/createApi";

const teamsApi = createApi({
  endpoints: {
    getHierarchy: () => ({
      url: "/api/v0/employee/hierarchy",
      isPaginated: false,
      shouldCache: true,
    }),
    // Get all employees for dropdown/autocomplete
    getAllEmployees: () => ({
      url: "/api/v0/employee/getAllEmployeeList",
      isPaginated: false,
      shouldCache: true,
    }),
  },
});

export const { useGetHierarchyQuery, useGetAllEmployeesQuery } = teamsApi;
