import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ─────────────────────────────────────────────
// Enums / constants (mirror backend)
// ─────────────────────────────────────────────
export type ListingType = "house" | "car" | "service";
export type ListingMode = "rent" | "sell";
export type ListingStatus = "active" | "inactive" | "occupied" | "sold";
export type CarType = "electric" | "fuel";
export type CarCondition = "used" | "new";
export type RentalPeriod = "daily" | "weekly" | "monthly" | "yearly";

// ─────────────────────────────────────────────
// Core types
// ─────────────────────────────────────────────
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

/** Unified listing type — fields are present based on listingType */
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

  // Owner / admin only
  ownerId?: string;
  paidUntil?: string;
  updatedAt?: string;
  isExpired?: boolean;
  daysRemaining?: number;

  // House fields
  houseType?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  tanker?: boolean;
  parking?: number;
  rentalPeriod?: RentalPeriod;

  // Car fields
  carType?: CarType;
  condition?: CarCondition;
  brand?: string;
  carModel?: string;

  // Service fields
  serviceType?: string;
}

// ─────────────────────────────────────────────
// Request / Response shapes
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Query / mutation param shapes
// ─────────────────────────────────────────────
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

/**
 * Pass all listing fields + images as FormData because the backend
 * uses multipart/form-data (multer upload middleware).
 *
 * Helper at bottom of file builds the FormData for you.
 */
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

  // House
  houseType?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  tanker?: boolean;
  parking?: number;
  rentalPeriod?: RentalPeriod;

  // Car
  carType?: CarType;
  condition?: CarCondition;
  brand?: string;
  carModel?: string;

  // Service
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

// ─────────────────────────────────────────────
// API slice
// ─────────────────────────────────────────────
export const listingsApi = createApi({
  reducerPath: "listingsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/listings`,
    // Backend auth reads from req.cookies.token — NOT the Authorization header.
    // credentials:"include" tells the browser to send cookies on every request,
    // including cross-origin calls to the Express server.
    credentials: "include",
  }),

  tagTypes: ["Listing", "MyListings", "AdminListings"],

  endpoints: (builder) => ({
    // ── Public ────────────────────────────────

    /** GET /listings/get-all  (active, non-expired) */
    getAllListings: builder.query<
      PaginatedListingsResponse,
      ListingQueryParams | void
    >({
      query: (params) => ({ url: "/get-all", params: params ?? {} }),
      providesTags: ["Listing"],
    }),

    /** GET /listings/:id/single-listing */
    getListingById: builder.query<SingleListingResponse, string>({
      query: (id) => `/${id}/single-listing`,
      providesTags: (_res, _err, id) => [{ type: "Listing", id }],
    }),

    /** GET /listings/search  — public search with filters */
    searchListings: builder.query<
      PaginatedListingsResponse,
      ListingQueryParams
    >({
      query: (params) => ({ url: "/search", params }),
      providesTags: ["Listing"],
    }),

    // ── Authenticated user ────────────────────

    /** GET /listings/get-my-listings */
    getMyListings: builder.query<
      PaginatedListingsResponse,
      ListingQueryParams | void
    >({
      query: (params) => ({ url: "/get-my-listings", params: params ?? {} }),
      providesTags: ["MyListings"],
    }),

    /** GET /listings/dashboard/search  — user's own listings with filters */
    searchMyListings: builder.query<
      PaginatedListingsResponse,
      ListingQueryParams
    >({
      query: (params) => ({ url: "/dashboard/search", params }),
      providesTags: ["MyListings"],
    }),

    /** POST /listings/create  — multipart/form-data */
    createListing: builder.mutation<CreateListingResponse, CreateListingParams>(
      {
        query: (params) => ({
          url: "/create",
          method: "POST",
          body: buildFormData(params),
          // Don't set Content-Type; browser sets it with the correct boundary
          formData: true,
        }),
        invalidatesTags: ["Listing", "MyListings"],
      },
    ),

    /** PUT /listings/:id/update  — multipart/form-data */
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

    /** PUT /listings/:id/status */
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

    // ── Admin ─────────────────────────────────

    /** GET /listings/admin/all */
    adminGetAllListings: builder.query<
      PaginatedListingsResponse,
      ListingQueryParams | void
    >({
      query: (params) => ({ url: "/admin/all", params: params ?? {} }),
      providesTags: ["AdminListings"],
    }),

    /** GET /listings/admin/search */
    adminSearchListings: builder.query<
      PaginatedListingsResponse,
      ListingQueryParams
    >({
      query: (params) => ({ url: "/admin/search", params }),
      providesTags: ["AdminListings"],
    }),
  }),
});

// ─────────────────────────────────────────────
// Exported hooks
// ─────────────────────────────────────────────
export const {
  // Public
  useGetAllListingsQuery,
  useGetListingByIdQuery,
  useSearchListingsQuery,

  // Authenticated user
  useGetMyListingsQuery,
  useSearchMyListingsQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useUpdateListingStatusMutation,

  // Admin
  useAdminGetAllListingsQuery,
  useAdminSearchListingsQuery,
} = listingsApi;

// ─────────────────────────────────────────────
// FormData builder (used internally by mutations)
// ─────────────────────────────────────────────
// The backend validator runs BEFORE the controller, and checks
// body("location.city") / body("location.placeName") as dot-notation
// fields on the parsed body — it does NOT parse the JSON string itself.
// So we send location fields in both forms:
//   1. Dot-notation fields  → satisfy express-validator
//   2. JSON string          → satisfy parseLocation() in the controller
function buildFormData(
  params: Partial<CreateListingParams> & { images?: File[] },
): FormData {
  const fd = new FormData();

  const { images, location, ...rest } = params;

  // Scalar fields
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      fd.append(key, String(value));
    }
  });

  if (location) {
    // 1. JSON string — used by parseLocation() in the controller
    fd.append("location", JSON.stringify(location));

    // 2. Dot-notation fields — used by express-validator before the controller runs
    fd.append("location.city", location.city);
    fd.append("location.placeName", location.placeName);
    if (location.subCity) fd.append("location.subCity", location.subCity);
    if (location.coordinates) {
      fd.append("location.coordinates.lat", String(location.coordinates.lat));
      fd.append("location.coordinates.lng", String(location.coordinates.lng));
    }
  }

  // Images — multer expects field name "images"
  if (images && images.length > 0) {
    images.forEach((file) => fd.append("images", file));
  }

  return fd;
}
