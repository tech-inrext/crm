import createApi from "@/fe/hooks/createApi";
import { VENDOR_BOOKING_API_BASE, CAB_BOOKING_PATCH_BASE } from "./constants";

const vendorBookingApi = createApi({
  endpoints: {
    getVendorBookings: (_params) => ({
      url: VENDOR_BOOKING_API_BASE,
      isPaginated: true,
      shouldCache: true,
      defaultPageSize: 6,
      pageSizeParamName: "limit",
    }),
  },
  mutations: {
    // params.id = booking _id; rest of params are the field updates
    updateBookingFields: (params: any) => ({
      url: `${CAB_BOOKING_PATCH_BASE}/${params.id}`,
      method: "patch",
    }),
  },
});

export const { useGetVendorBookingsQuery, useUpdateBookingFieldsMutation } =
  vendorBookingApi as any;
