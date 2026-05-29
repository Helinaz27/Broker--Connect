import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type ListingType = "house" | "car" | "service";
export type ListingMode = "rent" | "sell";
export type ListingStatus = "active" | "inactive" | "occupied" | "sold";
export type CarType = "electric" | "fuel";
export type CarCondition = "used" | "new";
export type RentalPeriod = "daily" | "weekly" | "monthly" | "yearly";

export interface ListingLocation {
  city: string;
  subCity?: string;
  placeName: string;
  coordinates?: { lat: number; lng: number };
  fullAddress?: string;
}

export interface ListingOwner {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface PostingDetails {
  durationDays: number;
  totalCoinsPaid: number;
  paidUntil: string;
  expiresIn: string;
  isActive: boolean;
}

export interface RenewalDetails {
  durationDays: number;
  totalCoinsPaid: number;
  newPaidUntil: string;
  isActive: boolean;
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
  owner?: ListingOwner;

  ownerId?: string;
  paidUntil?: string;
  updatedAt?: string;
  isExpired?: boolean;
  daysRemaining?: number;

  houseType?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  tanker?: boolean;
  parking?: number;
  rentalPeriod?: RentalPeriod;

  carType?: CarType;
  condition?: CarCondition;
  brand?: string;
  carModel?: string;

  serviceType?: string;
}

export interface PaginatedListingsResponse {
  success: boolean;
  message: string;
  data: {
    listings: Listing[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface SingleListingResponse {
  success: boolean;
  message: string;
  data: { listing: Listing };
}

export interface CreateListingResponse {
  success: boolean;
  message: string;
  data: {
    listing: Listing & {
      postingDetails: PostingDetails;
      currentCoinsRemaining: number;
    };
  };
}

export interface UpdateStatusResponse {
  success: boolean;
  message: string;
  data: { id: string; status: ListingStatus; updatedAt: string };
}

export interface RenewListingResponse {
  success: boolean;
  message: string;
  data: {
    listing: Listing & {
      renewalDetails: RenewalDetails;
      currentCoinsRemaining: number;
    };
  };
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
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  carType?: CarType;
  condition?: CarCondition;
  brand?: string;
  serviceType?: string;
  rentalPeriod?: RentalPeriod;
}

export interface CreateListingParams {
  listingType: ListingType;
  listingMode?: ListingMode;
  title: string;
  description: string;
  price: number;
  location: ListingLocation;
  contactCoinLimit?: number;
  durationDays: number;
  images: File[];

  houseType?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  tanker?: boolean;
  parking?: number;
  rentalPeriod?: RentalPeriod;

  carType?: CarType;
  condition?: CarCondition;
  brand?: string;
  carModel?: string;

  serviceType?: string;
}

export interface UpdateListingParams {
  id: string;
  body: Partial<Omit<CreateListingParams, "durationDays" | "images">> & {
    status?: ListingStatus;
    images?: File[];
  };
}

export interface UpdateStatusParams {
  id: string;
  status: ListingStatus;
}

export interface RenewListingParams {
  id: string;
  durationDays: number;
}

export const listingsApi = createApi({
  reducerPath: "listingsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/listings`,
    credentials: "include",
  }),

  tagTypes: ["Listing", "MyListings", "AdminListings"],

  endpoints: (builder) => ({
    getAllListings: builder.query<
      PaginatedListingsResponse,
      ListingQueryParams | void
    >({
      query: (params) => ({ url: "/get-all", params: params ?? {} }),
      providesTags: ["Listing"],
    }),

    getListingById: builder.query<SingleListingResponse, string>({
      query: (id) => `/${id}/single-listing`,
      providesTags: (_res, _err, id) => [{ type: "Listing", id }],
    }),

    searchListings: builder.query<
      PaginatedListingsResponse,
      ListingQueryParams
    >({
      query: (params) => ({ url: "/search", params }),
      providesTags: ["Listing"],
    }),

    getMyListings: builder.query<
      PaginatedListingsResponse,
      ListingQueryParams | void
    >({
      query: (params) => ({ url: "/get-my-listings", params: params ?? {} }),
      providesTags: ["MyListings"],
    }),

    searchMyListings: builder.query<
      PaginatedListingsResponse,
      ListingQueryParams
    >({
      query: (params) => ({ url: "/dashboard/search", params }),
      providesTags: ["MyListings"],
    }),

    createListing: builder.mutation<CreateListingResponse, CreateListingParams>(
      {
        query: (params) => ({
          url: "/create",
          method: "POST",
          body: buildFormData(params),
          formData: true,
        }),
        invalidatesTags: ["Listing", "MyListings"],
      },
    ),

    updateListing: builder.mutation<SingleListingResponse, UpdateListingParams>(
      {
        query: ({ id, body }) => ({
          url: `/${id}/update`,
          method: "PUT",
          body: buildFormData(body),
          formData: true,
        }),
        invalidatesTags: (_res, _err, { id }) => [
          "Listing",
          "MyListings",
          { type: "Listing", id },
        ],
      },
    ),

    updateListingStatus: builder.mutation<
      UpdateStatusResponse,
      UpdateStatusParams
    >({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        "Listing",
        "MyListings",
        "AdminListings",
        { type: "Listing", id },
      ],
    }),

    renewListing: builder.mutation<RenewListingResponse, RenewListingParams>({
      query: ({ id, durationDays }) => ({
        url: `/${id}/renewal`,
        method: "PUT",
        body: { durationDays },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        "Listing",
        "MyListings",
        { type: "Listing", id },
      ],
    }),

    adminGetAllListings: builder.query<
      PaginatedListingsResponse,
      ListingQueryParams | void
    >({
      query: (params) => ({ url: "/admin/all", params: params ?? {} }),
      providesTags: ["AdminListings"],
    }),

    adminSearchListings: builder.query<
      PaginatedListingsResponse,
      ListingQueryParams
    >({
      query: (params) => ({ url: "/admin/search", params }),
      providesTags: ["AdminListings"],
    }),
  }),
});

export const {
  useGetAllListingsQuery,
  useGetListingByIdQuery,
  useSearchListingsQuery,

  useGetMyListingsQuery,
  useSearchMyListingsQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useUpdateListingStatusMutation,
  useRenewListingMutation,

  useAdminGetAllListingsQuery,
  useAdminSearchListingsQuery,
} = listingsApi;

function buildFormData(
  params: Partial<CreateListingParams> & { images?: File[] },
): FormData {
  const fd = new FormData();

  const { images, location, ...rest } = params;

  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      fd.append(key, String(value));
    }
  });

  if (location) {
    fd.append("location", JSON.stringify(location));
    fd.append("location.city", location.city);
    fd.append("location.placeName", location.placeName);
    if (location.subCity) fd.append("location.subCity", location.subCity);
    if (location.coordinates) {
      fd.append("location.coordinates.lat", String(location.coordinates.lat));
      fd.append("location.coordinates.lng", String(location.coordinates.lng));
    }
  }

  if (images && images.length > 0) {
    images.forEach((file) => fd.append("images", file));
  }

  return fd;
}
