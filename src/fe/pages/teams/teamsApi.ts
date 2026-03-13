import createApi from "@/fe/hooks/createApi";

const teamsApi = createApi({
  endpoints: {
    // Get hierarchy for a manager
    getHierarchy: (params) => ({
      url: `/api/v0/employee/hierarchy?managerId=${params.managerId}`,
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
