import createApi from "@/fe/framework/hooks/createApi";

const vendorApi = createApi({
  endpoints: {
    getVendors: (_params) => ({
      url: "/api/v0/employee",
      isPaginated: true,
      shouldCache: true,
      defaultPageSize: 10,
    }),
  },
  mutations: {
    createVendor: () => ({
      url: "/api/v0/employee",
      method: "post",
    }),
    updateVendor: (params: any) => ({
      url: `/api/v0/employee/${params.id}`,
      method: "patch",
    }),
  },
});

export const {
  useGetVendorsQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
} = vendorApi as any;
