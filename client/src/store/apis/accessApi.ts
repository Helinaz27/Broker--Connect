// store/apis/accessApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

// ─── types ────────────────────────────────────────────────────────────────────

export type ListingType = "rent" | "sale" | "roommate";
export type ListingMode = "apartment" | "house" | "studio" | "office" | string;

export interface AccessListingOwner {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  profileImage?: string;
}

export interface AccessListing {
  id: string;
  title: string;
  listingType: ListingType;
  listingMode: ListingMode;
  price: number;
  location: string;
  images: string[];
  status: string;
  contactCoinLimit: number;
  owner: AccessListingOwner;
}

export interface ContactAccess {
  id: string;
  viewerId: string;
  ownerId: string;
  listingId: string;
  coinsPaid: number;
  isActive: boolean;
  createdAt: string;
  listing: AccessListing;
}

export interface AccessPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface MyAccessesData {
  accesses: ContactAccess[];
  pagination: AccessPagination;
}

export interface AdminAccessesData {
  accesses: ContactAccess[];
  pagination: AccessPagination;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AccessContactRequest {
  listingId: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ─── api ──────────────────────────────────────────────────────────────────────

export const accessApi = createApi({
  reducerPath: "accessApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Access", "MyAccesses"],
  endpoints: (builder) => ({
    // USER: unlock contact access for a listing
    accessContact: builder.mutation<
      ApiResponse<ContactAccess>,
      AccessContactRequest
    >({
      query: ({ listingId }) => ({
        url: "/contact-access/access",
        method: "POST",
        body: { listingId },
      }),
      invalidatesTags: ["MyAccesses"],
    }),

    // USER: get my unlocked listings (paginated)
    getMyAccesses: builder.query<
      ApiResponse<MyAccessesData>,
      PaginationParams | void
    >({
      query: (params) => ({
        url: "/contact-access/my-accesses",
        params: params ?? {},
      }),
      providesTags: ["MyAccesses"],
    }),

    // ADMIN: get all accesses
    adminGetAllAccesses: builder.query<
      ApiResponse<AdminAccessesData>,
      PaginationParams | void
    >({
      query: (params) => ({
        url: "/contact-access/admin/all",
        params: params ?? {},
      }),
      providesTags: ["Access"],
    }),

    // ADMIN: get accesses by listing
    adminGetAccessesByListing: builder.query<
      ApiResponse<AdminAccessesData>,
      { listingId: string } & PaginationParams
    >({
      query: ({ listingId, ...params }) => ({
        url: `/contact-access/admin/listing/${listingId}`,
        params,
      }),
      providesTags: (_result, _error, { listingId }) => [
        { type: "Access", id: `listing-${listingId}` },
      ],
    }),

    // ADMIN: get accesses by user
    adminGetAccessesByUser: builder.query<
      ApiResponse<AdminAccessesData>,
      { userId: string } & PaginationParams
    >({
      query: ({ userId, ...params }) => ({
        url: `/contact-access/admin/user/${userId}`,
        params,
      }),
      providesTags: (_result, _error, { userId }) => [
        { type: "Access", id: `user-${userId}` },
      ],
    }),
  }),
});

export const {
  useAccessContactMutation,
  useGetMyAccessesQuery,
  useAdminGetAllAccessesQuery,
  useAdminGetAccessesByListingQuery,
  useAdminGetAccessesByUserQuery,
} = accessApi;
