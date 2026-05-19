import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Types
export interface KYCRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  documents: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  status: "active" | "inactive" | "banned";
  listings: number;
  coins: number;
}

export interface PlatformFee {
  id: string;
  name: string;
  description: string;
  amount: number;
  percentage: number;
  category: "house" | "car" | "otherService";
}

// API Slice
export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  }),
  tagTypes: ["KYC", "Users", "Fees"],
  endpoints: (builder) => ({
    // KYC Management
    getKYCRequests: builder.query<KYCRequest[], { status?: string; page?: number }>({
      query: (params) => ({
        url: "/admin/kyc",
        params,
      }),
      providesTags: ["KYC"],
    }),

    getKYCById: builder.query<KYCRequest, string>({
      query: (id) => `/admin/kyc/${id}`,
      providesTags: ["KYC"],
    }),

    approveKYC: builder.mutation<KYCRequest, string>({
      query: (id) => ({
        url: `/admin/kyc/${id}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["KYC"],
    }),

    rejectKYC: builder.mutation<KYCRequest, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/kyc/${id}/reject`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: ["KYC"],
    }),

    // Users Management
    getUsers: builder.query<User[], { page?: number; search?: string }>({
      query: (params) => ({
        url: "/admin/users",
        params,
      }),
      providesTags: ["Users"],
    }),

    getUserById: builder.query<User, string>({
      query: (id) => `/admin/users/${id}`,
      providesTags: ["Users"],
    }),

    updateUserStatus: builder.mutation<
      User,
      { id: string; status: "active" | "inactive" | "banned" }
    >({
      query: ({ id, status }) => ({
        url: `/admin/users/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Users"],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    // Platform Fees
    getPlatformFees: builder.query<PlatformFee[], void>({
      query: () => "/admin/fees",
      providesTags: ["Fees"],
    }),

    updateFee: builder.mutation<
      PlatformFee,
      { id: string; body: Partial<PlatformFee> }
    >({
      query: ({ id, body }) => ({
        url: `/admin/fees/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Fees"],
    }),

    updateAllFees: builder.mutation<PlatformFee[], PlatformFee[]>({
      query: (body) => ({
        url: "/admin/fees",
        method: "PATCH",
        body: { fees: body },
      }),
      invalidatesTags: ["Fees"],
    }),
  }),
});

export const {
  useGetKYCRequestsQuery,
  useGetKYCByIdQuery,
  useApproveKYCMutation,
  useRejectKYCMutation,

  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,

  useGetPlatformFeesQuery,
  useUpdateFeeMutation,
  useUpdateAllFeesMutation,
} = adminApi;
