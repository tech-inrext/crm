import createApi from "@/fe/hooks/createApi";

const userApi = createApi({
  endpoints: {
    getUsers: (params) => ({
      url: "/api/v0/employee",
      isPaginated: true,
    }),
    getUserById: (params) => ({
      url: `/api/v0/employee/${params.id}`,
      modifiedParams: (params) => ({
        id: params.id,
      }),
      isPaginated: false,
    }),
  },
});
const { useGetUsersQuery, useGetUserByIdQuery, useGetLeadsQuery } = userApi;
export { useGetUsersQuery, useGetUserByIdQuery, useGetLeadsQuery };
