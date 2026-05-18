import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Types
export interface House {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  placeName: string;
  subCity?: string;
  houseType: "condominium" | "villa" | "business" | "apartment" | "others";
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  tanker?: boolean;
  rentalPeriod?: "daily" | "weekly" | "monthly" | "yearly";
  parking: boolean;
  listingMode: "rent" | "sell";
  images: string[];
  rating: number;
  status: "active" | "inactive" | "pending";
}

export interface Car {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  placeName: string;
  subCity?: string;
  carType: "electric" | "fuel";
  condition: "used" | "new";
  brand: string;
  carModel: string;
  images: string[];
  rating: number;
  listingMode: "rent" | "sell";
  status: "active" | "inactive" | "pending";
}

export interface OtherService {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  placeName: string;
  subCity?: string;
  serviceType: string;
  images: string[];
  rating: number;
  status: "active" | "inactive" | "pending";
}

export interface FilterParams {
  category?: "house" | "car" | "otherService" | "all";
  listingMode?: "rent" | "sell";
  search?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  limit?: number;
}

// API Slice
export const listingsApi = createApi({
  reducerPath: "listingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  }),
  tagTypes: ["House", "Car", "OtherService", "UserListings"],
  endpoints: (builder) => ({
    // House Listings
    getHouses: builder.query<{ data: House[]; total: number }, FilterParams>({
      query: (params) => ({
        url: "/listings/houses",
        params,
      }),
      providesTags: ["House"],
    }),

    getHouseById: builder.query<House, string>({
      query: (id) => `/listings/houses/${id}`,
      providesTags: ["House"],
    }),

    createHouse: builder.mutation<House, Partial<House>>({
      query: (body) => ({
        url: "/listings/houses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["House", "UserListings"],
    }),

    updateHouse: builder.mutation<House, { id: string; body: Partial<House> }>({
      query: ({ id, body }) => ({
        url: `/listings/houses/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["House", "UserListings"],
    }),

    deleteHouse: builder.mutation<void, string>({
      query: (id) => ({
        url: `/listings/houses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["House", "UserListings"],
    }),

    // Car Listings
    getCars: builder.query<{ data: Car[]; total: number }, FilterParams>({
      query: (params) => ({
        url: "/listings/cars",
        params,
      }),
      providesTags: ["Car"],
    }),

    getCarById: builder.query<Car, string>({
      query: (id) => `/listings/cars/${id}`,
      providesTags: ["Car"],
    }),

    createCar: builder.mutation<Car, Partial<Car>>({
      query: (body) => ({
        url: "/listings/cars",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Car", "UserListings"],
    }),

    updateCar: builder.mutation<Car, { id: string; body: Partial<Car> }>({
      query: ({ id, body }) => ({
        url: `/listings/cars/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Car", "UserListings"],
    }),

    deleteCar: builder.mutation<void, string>({
      query: (id) => ({
        url: `/listings/cars/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Car", "UserListings"],
    }),

    // Other Services
    getOtherServices: builder.query<
      { data: OtherService[]; total: number },
      FilterParams
    >({
      query: (params) => ({
        url: "/listings/services",
        params,
      }),
      providesTags: ["OtherService"],
    }),

    getOtherServiceById: builder.query<OtherService, string>({
      query: (id) => `/listings/services/${id}`,
      providesTags: ["OtherService"],
    }),

    createOtherService: builder.mutation<OtherService, Partial<OtherService>>({
      query: (body) => ({
        url: "/listings/services",
        method: "POST",
        body,
      }),
      invalidatesTags: ["OtherService", "UserListings"],
    }),

    updateOtherService: builder.mutation<
      OtherService,
      { id: string; body: Partial<OtherService> }
    >({
      query: ({ id, body }) => ({
        url: `/listings/services/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["OtherService", "UserListings"],
    }),

    deleteOtherService: builder.mutation<void, string>({
      query: (id) => ({
        url: `/listings/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["OtherService", "UserListings"],
    }),

    // User Listings
    getUserListings: builder.query<
      { data: (House | Car | OtherService)[]; total: number },
      FilterParams
    >({
      query: (params) => ({
        url: "/listings/user",
        params,
      }),
      providesTags: ["UserListings"],
    }),
  }),
});

export const {
  useGetHousesQuery,
  useGetHouseByIdQuery,
  useCreateHouseMutation,
  useUpdateHouseMutation,
  useDeleteHouseMutation,

  useGetCarsQuery,
  useGetCarByIdQuery,
  useCreateCarMutation,
  useUpdateCarMutation,
  useDeleteCarMutation,

  useGetOtherServicesQuery,
  useGetOtherServiceByIdQuery,
  useCreateOtherServiceMutation,
  useUpdateOtherServiceMutation,
  useDeleteOtherServiceMutation,

  useGetUserListingsQuery,
} = listingsApi;
