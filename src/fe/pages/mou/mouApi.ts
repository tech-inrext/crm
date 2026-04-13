import createApi from "@/fe/framework/hooks/createApi";
import { DEFAULT_PAGE_SIZE } from "./constants/mou";


const mouApi = createApi({
  endpoints: {
    getMous: (params) => ({
      url: "/api/v0/employee",
      isPaginated: true,
      defaultPageSize: DEFAULT_PAGE_SIZE,
      shouldCache: true,
    }),
  },
  mutations: {
    /**
     * Update the MOU status of an employee.
     */
    updateMou: (params) => ({
      url: `/api/v0/employee/${params.id}`,
      method: "patch",
    }),
    /**
     * Approve an MOU and send it to the associate.
     */
    approveAndSend: (params) => ({
      url: `/api/v0/mou/approve-and-send/${params.id}`,
      method: "post",
    }),
    /**
     * Resend the MOU email to the associate.
     */
    resendMail: (params) => ({
      url: `/api/v0/mou/resend-mail/${params.id}`,
      method: "post",
    }),
  },
});

export const {
  useGetMousQuery,
  useUpdateMouMutation,
  useApproveAndSendMutation,
  useResendMailMutation,
} = mouApi;

export default mouApi;
