// store/apis/adminApi.ts
// Admin-only endpoints — KYC management, user management, platform fees
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { API_BASE_URL } from "../../constants/api";

export interface KYCRequest {
  id: string;
  userId: string;
  user: { firstName: string; lastName: string; email: string; phone: string };
  documentType: string;
  documentNumber: string;
  frontSideImage: string;
  backSideImage?: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: string[];
  coins: number;
  isActive: boolean;
  isKYCVerified: boolean;
  createdAt: string;
}

export interface PlatformFee {
  id: string;
  name: string;
  description?: string;
  feeType: string;
  category: string;
  listingMode?: string;
  coinAmount: number;
  durationDays: number;
  isActive: boolean;
  createdAt: string;
}

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["KYC", "AdminUsers", "PlatformFees"],
  endpoints: (builder) => ({
    // ── KYC admin ────────────────────────────────────────────────────────────
    getAllKYC: builder.query<
      {
        success: boolean;
        data: { kycRequests: KYCRequest[]; pagination: any };
      },
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => ({
        url: "/kyc/get-all",
        params: (params ?? {}) as Record<string, any>,
      }),
      providesTags: ["KYC"],
    }),
    getKYCById: builder.query<
      { success: boolean; data: { kycRequest: KYCRequest } },
      string
    >({
      query: (id) => `/kyc/${id}/getkyc`,
      providesTags: ["KYC"],
    }),
    approveKYC: builder.mutation<{ success: boolean; message: string }, string>(
      {
        query: (id) => ({ url: `/kyc/${id}/approve`, method: "PUT" }),
        invalidatesTags: ["KYC"],
      },
    ),
    rejectKYC: builder.mutation<
      { success: boolean; message: string },
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/kyc/${id}/reject`,
        method: "PATCH",
        body: { reason },
      }),
      invalidatesTags: ["KYC"],
    }),

    // ── Users admin ───────────────────────────────────────────────────────────
    getAllUsers: builder.query<
      { success: boolean; data: { users: AdminUser[]; pagination: any } },
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (params) => ({
        url: "/users/admin/all",
        params: params ? (params as Record<string, any>) : undefined,
      }),
      providesTags: ["AdminUsers"],
    }),
    updateUserStatus: builder.mutation<
      { success: boolean; message: string },
      { userId: string; isActive: boolean }
    >({
      query: ({ userId, isActive }) => ({
        url: `/users/admin/${userId}/status`,
        method: "PUT",
        body: { isActive },
      }),
      invalidatesTags: ["AdminUsers"],
    }),
    deleteUser: builder.mutation<{ success: boolean; message: string }, string>(
      {
        query: (userId) => ({
          url: `/users/admin/${userId}`,
          method: "DELETE",
        }),
        invalidatesTags: ["AdminUsers"],
      },
    ),

    // ── Platform fees admin ───────────────────────────────────────────────────
    getAllFees: builder.query<
      {
        success: boolean;
        data: { platformFees: PlatformFee[]; pagination: any };
      },
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/platform-fees/get-all",
        params: params ? (params as Record<string, any>) : undefined,
      }),
      providesTags: ["PlatformFees"],
    }),
    createFee: builder.mutation<{ success: boolean }, Partial<PlatformFee>>({
      query: (body) => ({ url: "/platform-fees/create", method: "POST", body }),
      invalidatesTags: ["PlatformFees"],
    }),
    updateFee: builder.mutation<
      { success: boolean },
      { id: string } & Partial<PlatformFee>
    >({
      query: ({ id, ...body }) => ({
        url: `/platform-fees/${id}/update`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["PlatformFees"],
    }),
    deleteFee: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/platform-fees/${id}/delete`, method: "DELETE" }),
      invalidatesTags: ["PlatformFees"],
    }),
  }),
});

export const {
  useGetAllKYCQuery,
  useGetKYCByIdQuery,
  useApproveKYCMutation,
  useRejectKYCMutation,
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetAllFeesQuery,
  useCreateFeeMutation,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
} = adminApi;
