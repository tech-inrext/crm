import createApi from "@/fe/hooks/createApi";
import { DEPARTMENTS_API_BASE } from "@/fe/pages/department/constants/departments";

const departmentApi = createApi({
  endpoints: {
    // List of departments
    getDepartments: () => ({
      url: DEPARTMENTS_API_BASE,
      isPaginated: true,
    }),
    // Single department by ID
    getDepartmentById: (params) => ({
      url: `${DEPARTMENTS_API_BASE}/${params.id}`,
      isPaginated: false,
    }),
    // Dropdown: all employees (for manager selection)
    getManagers: () => ({
      url: "/api/v0/employee/getAllEmployeeList",
      isPaginated: false,
    }),
  },
});

const {
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useGetManagersQuery,
} = departmentApi as {
  useGetDepartmentsQuery: (params?: Record<string, unknown>) => any;
  useGetDepartmentByIdQuery: (params?: Record<string, unknown>) => any;
  useGetManagersQuery: (params?: Record<string, unknown>) => any;
};

export {
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useGetManagersQuery,
};
