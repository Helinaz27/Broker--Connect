// store/apis/kycApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

// ─── types ────────────────────────────────────────────────────────────────────

export type DocumentType = "national_id" | "passport" | "driving_license";
export type KYCStatus = "pending" | "approved" | "rejected";

export interface KYCUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: string;
}

export interface KYCRequest {
  id: string;
  documentType: DocumentType;
  documentNumber: string;
  frontSideImage: string;
  backSideImage?: string;
  status: KYCStatus;
  submittedAt: string;
  user?: KYCUser;
  verifiedAt?: string;
  approvedBy?: { id: string; name: string };
  rejectedAt?: string;
  rejectedBy?: { id: string; name: string };
  reason?: string;
}

export interface MyKYCStatusData {
  isKYCVerified?: boolean;
  kycSubmitted: boolean;
  status: KYCStatus | null;
  documentType?: DocumentType;
  submittedAt?: string;
  nextAction?: string;
  recommendation?: string;
  reason?: string;
}

export interface KYCListData {
  kycRequests: KYCRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface SubmitKYCRequest {
  documentType: DocumentType;
  documentNumber: string;
  frontSideImage: File;
  backSideImage?: File; // Made optional since some docs might not have back side
}

export interface GetAllKYCParams {
  status?: "all" | KYCStatus;
  page?: number;
  limit?: number;
}

// ─── api ──────────────────────────────────────────────────────────────────────

export const kycApi = createApi({
  reducerPath: "kycApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["KYC", "MyKYC"],
  endpoints: (builder) => ({
    // USER: submit KYC (multipart/form-data)
    submitKYC: builder.mutation<
      ApiResponse<{ kycRequest: KYCRequest }>,
      SubmitKYCRequest
    >({
      query: ({
        documentType,
        documentNumber,
        frontSideImage,
        backSideImage,
      }) => {
        const formData = new FormData();
        formData.append("documentType", documentType);
        formData.append("documentNumber", documentNumber);
        formData.append("frontSideImage", frontSideImage);
        if (backSideImage) {
          formData.append("backSideImage", backSideImage);
        }
        return {
          url: "/kyc/submit",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["MyKYC"],
    }),

    // USER: get own KYC status
    getMyKYCStatus: builder.query<ApiResponse<MyKYCStatusData>, void>({
      query: () => "/kyc/my-status",
      providesTags: ["MyKYC"],
    }),

    // ADMIN: get all KYC requests
    getAllKYC: builder.query<ApiResponse<KYCListData>, GetAllKYCParams | void>({
      query: (params) => ({
        url: "/kyc/get-all",
        params: params ?? {},
      }),
      providesTags: ["KYC"],
    }),

    // ADMIN: get single KYC by id
    getKYCById: builder.query<ApiResponse<{ kycRequest: KYCRequest }>, string>({
      query: (requestId) => `/kyc/${requestId}/getkyc`,
      providesTags: (_result, _error, id) => [{ type: "KYC", id }],
    }),

    // ADMIN: approve KYC
    approveKYC: builder.mutation<ApiResponse, string>({
      query: (requestId) => ({
        url: `/kyc/${requestId}/approve`,
        method: "PUT",
      }),
      invalidatesTags: ["KYC", "MyKYC"],
    }),

    // ADMIN: reject KYC
    rejectKYC: builder.mutation<
      ApiResponse,
      { requestId: string; reviewNote?: string }
    >({
      query: ({ requestId, reviewNote }) => ({
        url: `/kyc/${requestId}/reject`,
        method: "PATCH",
        body: { reviewNote },
      }),
      invalidatesTags: ["KYC", "MyKYC"],
    }),
  }),
});

export const {
  useSubmitKYCMutation,
  useGetMyKYCStatusQuery,
  useGetAllKYCQuery,
  useGetKYCByIdQuery,
  useApproveKYCMutation,
  useRejectKYCMutation,
} = kycApi;
