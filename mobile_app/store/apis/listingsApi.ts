import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { API_BASE_URL } from "../../constants/api";

export type ListingType = "house" | "car" | "service";
export type ListingMode = "rent" | "sell";
export type ListingStatus = "active" | "inactive" | "occupied" | "sold";

export interface ListingLocation {
  city: string;
  subCity?: string;
  placeName: string;
  coordinates?: { lat: number; lng: number };
  fullAddress?: string;
}

export interface Listing {
  id: string;
  listingType: ListingType;
  listingMode?: ListingMode;
  title: string;
  description: string;
  price: number;
  images: string[];
  location: ListingLocation;
  contactCoinLimit: number;
  status: ListingStatus;
  createdAt: string;
  owner?: { id: string; name: string; phone: string; email: string };
  ownerId?: string;
  paidUntil?: string;
  isExpired?: boolean;
  daysRemaining?: number;
  houseType?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  tanker?: boolean;
  parking?: number;
  rentalPeriod?: string;
  carType?: string;
  condition?: string;
  brand?: string;
  carModel?: string;
  serviceType?: string;
}

export interface PaginatedListingsResponse {
  success: boolean;
  message: string;
  data: {
    listings: Listing[];
    pagination: { page: number; limit: number; total: number; pages: number };
  };
}

export interface SingleListingResponse {
  success: boolean;
  message: string;
  data: { listing: Listing };
}

export interface ListingQueryParams {
  page?: number;
  limit?: number;
  listingType?: ListingType;
  listingMode?: ListingMode;
  status?: ListingStatus | "all";
  search?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  houseType?: string;
  bedrooms?: number;
  brand?: string;
  serviceType?: string;
}

export const listingsApi = createApi({
  reducerPath: "listingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/listings`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Listing", "MyListings"],
  endpoints: (builder) => ({
    searchListings: builder.query<
      PaginatedListingsResponse,
      ListingQueryParams
    >({
      query: (params) => ({ url: "/search", params }),
      providesTags: ["Listing"],
    }),
    getListingById: builder.query<SingleListingResponse, string>({
      query: (id) => `/${id}/single-listing`,
      providesTags: (_res, _err, id) => [{ type: "Listing", id }],
    }),
    getMyListings: builder.query<
      PaginatedListingsResponse,
      ListingQueryParams | void
    >({
      query: (params) => ({
        url: "/get-my-listings",
        params: params ? (params as Record<string, any>) : undefined,
      }),
      providesTags: ["MyListings"],
    }),
    createListing: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/create",
        method: "POST",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["Listing", "MyListings"],
    }),
    updateListing: builder.mutation<any, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/${id}/update`,
        method: "PUT",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["Listing", "MyListings"],
    }),
    updateListingStatus: builder.mutation<
      any,
      { id: string; status: ListingStatus }
    >({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Listing", "MyListings"],
    }),
  }),
});

export const {
  useSearchListingsQuery,
  useGetListingByIdQuery,
  useGetMyListingsQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useUpdateListingStatusMutation,
} = listingsApi;
