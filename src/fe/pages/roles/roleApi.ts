import createApi from "@/fe/framework/hooks/createApi";

const roleApi = createApi({
  endpoints: {
    getRoles: (params) => ({
      url: "/api/v0/role",
      isPaginated: true,
      shouldCache: true,
      defaultPageSize: 8,
    }),
  },
  mutations: {
    createRole: () => ({
      url: "/api/v0/role",
      method: "post",
    }),
    updateRole: (params) => ({
      url: `/api/v0/role/${params.id}`,
      method: "patch",
    }),
  },
});

export const {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
} = roleApi;
