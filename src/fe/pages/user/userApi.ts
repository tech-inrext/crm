import createApi from "@/fe/hooks/createApi";

const userApi = createApi({
  endpoints: {
    // List of employees (paginated)
    getUsers: (params) => ({
      url: "/api/v0/employee",
      isPaginated: true,
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
  },
});

const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetRolesQuery,
  useGetManagersQuery,
  useGetDepartmentsQuery,
} = userApi as {
  useGetUsersQuery: (
    params?: Record<string, unknown>,
  ) => ReturnType<
    typeof import("@/fe/hooks/createApi").default extends infer T
      ? never
      : never
  > &
    any;
  useGetUserByIdQuery: (params?: Record<string, unknown>) => any;
  useGetRolesQuery: (params?: Record<string, unknown>) => any;
  useGetManagersQuery: (params?: Record<string, unknown>) => any;
  useGetDepartmentsQuery: (params?: Record<string, unknown>) => any;
};

export {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetRolesQuery,
  useGetManagersQuery,
  useGetDepartmentsQuery,
};
