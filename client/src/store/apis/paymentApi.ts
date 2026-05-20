// store/apis/paymentApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

// ─── types ────────────────────────────────────────────────────────────────────

export type PaymentStatus = "pending" | "processing" | "success" | "failed";
export type PaymentMethod = "chapa";

export interface PaymentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface Payment {
  id: string;
  userId: string;
  amountBirr: number;
  coinsReceived: number;
  paymentMethod: PaymentMethod;
  transactionId: string;
  status: PaymentStatus;
  completedAt?: string;
  createdAt: string;
  user?: PaymentUser;
}

export interface PaymentPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface MyPaymentsData {
  payments: Payment[];
  pagination: PaymentPagination;
}

export interface InitiateChapaResponse {
  checkout_url: string;
  tx_ref: string;
  amountBirr: number;
  coinsRequested: number;
  paymentId: string;
}

export interface VerifyChapaResponse {
  coinsReceived: number;
  currentCoinBalance: number;
  payment: Payment;
}

export interface CoinBalanceData {
  coins: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface InitiateChapaRequest {
  coinsRequested: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface AdminGetAllPaymentsParams extends PaginationParams {
  status?: PaymentStatus | "all";
  paymentMethod?: PaymentMethod;
}

export interface AdminSearchPaymentParams extends PaginationParams {
  transactionId?: string;
  status?: PaymentStatus;
}

export interface UpdatePaymentStatusRequest {
  id: string;
  status: PaymentStatus;
  completedAt?: string;
}

// ─── api ──────────────────────────────────────────────────────────────────────

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Payment", "CoinBalance"],
  endpoints: (builder) => ({
    // USER: initiate Chapa payment
    initiateChapa: builder.mutation<
      ApiResponse<InitiateChapaResponse>,
      InitiateChapaRequest
    >({
      query: ({ coinsRequested }) => ({
        url: "/payments/initiate",
        method: "POST",
        body: { coinsRequested },
      }),
    }),

    // USER: verify payment after redirect
    verifyChapa: builder.query<ApiResponse<VerifyChapaResponse>, string>({
      query: (tx_ref) => `/payment/verify/${tx_ref}`,
      providesTags: ["CoinBalance", "Payment"],
    }),

    // USER: get my payments (paginated)
    getMyPayments: builder.query<
      ApiResponse<MyPaymentsData>,
      PaginationParams | void
    >({
      query: (params) => ({
        url: "/payments/my-payments",
        params: params ?? {},
      }),
      providesTags: ["Payment"],
    }),

    // USER: get coin balance
    getCoinBalance: builder.query<ApiResponse<CoinBalanceData>, void>({
      query: () => "/payment/check-balance",
      providesTags: ["CoinBalance"],
    }),

    // ADMIN: get all payments
    adminGetAllPayments: builder.query<
      ApiResponse<MyPaymentsData>,
      AdminGetAllPaymentsParams | void
    >({
      query: (params) => ({
        url: "/payments/admin/all",
        params: params ?? {},
      }),
      providesTags: ["Payment"],
    }),

    // ADMIN: search payments
    adminSearchPayment: builder.query<
      ApiResponse<MyPaymentsData>,
      AdminSearchPaymentParams | void
    >({
      query: (params) => ({
        url: "/payments/admin/search",
        params: params ?? {},
      }),
      providesTags: ["Payment"],
    }),

    // ADMIN: update payment status
    adminUpdatePaymentStatus: builder.mutation<
      ApiResponse<{ payment: Payment }>,
      UpdatePaymentStatusRequest
    >({
      query: ({ id, ...body }) => ({
        url: `/payments/admin/update/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Payment"],
    }),

    // ADMIN: delete payment
    adminDeletePayment: builder.mutation<ApiResponse, string>({
      query: (id) => ({
        url: `/payments/admin/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Payment"],
    }),
  }),
});

export const {
  useInitiateChapaMutation,
  useVerifyChapaQuery,
  useGetMyPaymentsQuery,
  useGetCoinBalanceQuery,
  useAdminGetAllPaymentsQuery,
  useAdminSearchPaymentQuery,
  useAdminUpdatePaymentStatusMutation,
  useAdminDeletePaymentMutation,
} = paymentApi;
