import createApi from "@/fe/hooks/createApi";

const userApi = createApi({
  endpoints: {
    // List of employees (paginated)
    getUsers: (params) => ({
      url: "/api/v0/employee",
      isPaginated: true,
      shouldCache: true, // Cache the employee list for better performance
    }),
    // Single employee by ID
    getUserById: (params) => ({
      url: `/api/v0/employee/${params.id}`,
      isPaginated: false,
    }),
    // Dropdown data for the user dialog
    getRoles: () => ({
      url: "/api/v0/role/getAllRoleList",
      isPaginated: false,
    }),
    getManagers: () => ({
      url: "/api/v0/employee/getAllEmployeeList",
      isPaginated: false,
    }),
    getDepartments: () => ({
      url: "/api/v0/department",
      isPaginated: false,
    }),
    getMyTeamHierarchy: (params) => ({
      url: "/api/v0/employee/hierarchy",
      isPaginated: false,
      shouldCache: true,
    }),
  },
  mutations: {
    // Create a new employee
    createUser: () => ({
      url: "/api/v0/employee",
      method: "post",
    }),
    updateUser: (params) => ({
      url: `/api/v0/employee/${params.id}`,
      method: "patch",
    }),
  },
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetRolesQuery,
  useGetManagersQuery,
  useGetDepartmentsQuery,
  useGetMyTeamHierarchyQuery,

  // Mutations
  useCreateUserMutation,
  useUpdateUserMutation,
} = userApi;
