import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: string[];
  coins: number;
  isActive: boolean;
  isKYCVerified: boolean;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UsersListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["User", "Profile"],
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<AuthResponse>, RegisterRequest>({
      query: (body) => ({ url: "/users/register", method: "POST", body }),
    }),
    login: builder.mutation<ApiResponse<AuthResponse>, LoginRequest>({
      query: (body) => ({ url: "/users/login", method: "POST", body }),
      invalidatesTags: ["User", "Profile"],
    }),
    logout: builder.mutation<ApiResponse, void>({
      query: () => ({ url: "/users/logout", method: "POST" }),
      invalidatesTags: ["User", "Profile"],
    }),
    forgotPassword: builder.mutation<ApiResponse, { email: string }>({
      query: (body) => ({
        url: "/users/forgot-password",
        method: "POST",
        body,
      }),
    }),
    verifyResetOtp: builder.mutation<
      ApiResponse<{ resetToken: string }>,
      { email: string; otp: string }
    >({
      query: (body) => ({
        url: "/users/verify-reset-otp",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<
      ApiResponse,
      { token: string; newPassword: string }
    >({
      query: (body) => ({ url: "/users/reset-password", method: "POST", body }),
    }),
    changePassword: builder.mutation<ApiResponse, ChangePasswordRequest>({
      query: (body) => ({
        url: "/users/change-password",
        method: "POST",
        body,
      }),
    }),
    getProfile: builder.query<ApiResponse<{ user: User }>, void>({
      query: () => "/users/profile",
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation<
      ApiResponse<{ user: User }>,
      UpdateProfileRequest
    >({
      query: (body) => ({ url: "/users/profile", method: "PUT", body }),
      invalidatesTags: ["Profile"],
    }),
    getUserById: builder.query<ApiResponse<{ user: User }>, string>({
      query: (userId) => `/users/${userId}`,
    }),
    getAllUsers: builder.query<
      ApiResponse<UsersListResponse>,
      {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
        isActive?: boolean;
      }
    >({
      query: (params) => ({ url: "/users/admin/all", params }),
      providesTags: ["User"],
    }),
    updateUserStatus: builder.mutation<
      ApiResponse,
      { userId: string; isActive: boolean }
    >({
      query: ({ userId, isActive }) => ({
        url: `/users/admin/${userId}/status`,
        method: "PUT",
        body: { isActive },
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation<ApiResponse, string>({
      query: (userId) => ({ url: `/users/admin/${userId}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetUserByIdQuery,
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} = userApi;
