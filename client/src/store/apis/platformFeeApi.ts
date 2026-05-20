// store/apis/platformFeeApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export type FeeType = "posting_fee" | "contact_access_fee";
export type Category = "house" | "car" | "service";
export type ListingMode = "rent" | "sell";

export interface PlatformFee {
  id: string;
  feeType: FeeType;
  category: Category | null;
  listingMode: ListingMode | null;
  durationDays: number | null;
  coinAmount: number;
  description: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlatformFeeRequest {
  feeType: FeeType;
  category?: Category;
  listingMode?: ListingMode;
  durationDays?: number;
  coinAmount: number;
  description?: string;
}

export interface UpdatePlatformFeeRequest {
  category?: Category;
  listingMode?: ListingMode | null;
  durationDays?: number;
  coinAmount?: number;
  description?: string;
  isActive?: boolean;
}

export interface PlatformFeeListData {
  platformFees: PlatformFee[];
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

export interface SearchPlatformFeesParams {
  q?: string;
  feeType?: FeeType;
  category?: Category;
  listingMode?: ListingMode;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const platformFeeApi = createApi({
  reducerPath: "platformFeeApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["PlatformFee"],
  endpoints: (builder) => ({
    createPlatformFee: builder.mutation<
      ApiResponse<{ platformFee: PlatformFee }>,
      CreatePlatformFeeRequest
    >({
      query: (data) => ({
        url: "/platform-fees/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PlatformFee"],
    }),

    getAllPlatformFees: builder.query<
      ApiResponse<PlatformFeeListData>,
      { page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "/platform-fees/get-all",
        method: "GET",
        params,
      }),
      providesTags: ["PlatformFee"],
    }),

    searchPlatformFees: builder.query<
      ApiResponse<PlatformFeeListData>,
      SearchPlatformFeesParams
    >({
      query: (params) => ({
        url: "/platform-fees/search",
        method: "GET",
        params,
      }),
      providesTags: ["PlatformFee"],
    }),

    getPlatformFeeById: builder.query<
      ApiResponse<{ platformFee: PlatformFee }>,
      string
    >({
      query: (id) => `/platform-fees/${id}`,
      providesTags: (_result, _error, id) => [{ type: "PlatformFee", id }],
    }),

    updatePlatformFee: builder.mutation<
      ApiResponse<{ platformFee: PlatformFee }>,
      { id: string; data: UpdatePlatformFeeRequest }
    >({
      query: ({ id, data }) => {
        const cleanedData: any = { ...data };
        if (
          cleanedData.listingMode === null ||
          cleanedData.listingMode === undefined
        ) {
          delete cleanedData.listingMode;
        }
        return {
          url: `/platform-fees/${id}/update`,
          method: "PUT",
          body: cleanedData,
        };
      },
      invalidatesTags: ["PlatformFee"],
    }),

    togglePlatformFeeStatus: builder.mutation<
      ApiResponse<{ platformFee: PlatformFee }>,
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/platform-fees/${id}/update`,
        method: "PUT",
        body: { isActive },
      }),
      invalidatesTags: ["PlatformFee"],
    }),

    deletePlatformFee: builder.mutation<
      ApiResponse<{ platformFee: PlatformFee }>,
      string
    >({
      query: (id) => ({
        url: `/platform-fees/${id}/delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["PlatformFee"],
    }),
  }),
});

export const {
  useCreatePlatformFeeMutation,
  useGetAllPlatformFeesQuery,
  useSearchPlatformFeesQuery,
  useGetPlatformFeeByIdQuery,
  useUpdatePlatformFeeMutation,
  useTogglePlatformFeeStatusMutation,
  useDeletePlatformFeeMutation,
} = platformFeeApi;
