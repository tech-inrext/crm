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
  mutations: {
    createDepartment: () => ({
      url: DEPARTMENTS_API_BASE,
      method: "post",
    }),
    updateDepartment: (params) => ({
      url: `${DEPARTMENTS_API_BASE}/${params.id}`,
      method: "patch",
    }),
    deleteDepartment: (params) => ({
      url: `${DEPARTMENTS_API_BASE}/${params.id}`,
      method: "delete",
    }),
  },
});

export const {
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useGetManagersQuery,

  // Mutations
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentApi as any;
