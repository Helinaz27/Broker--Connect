// store/apis/userApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { API_BASE_URL } from '../../constants/api';
import { User } from '../slices/userSlice';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
export interface AuthResponse { token: string; user: User; }
export interface RegisterRequest { firstName: string; lastName: string; email: string; phone: string; password: string; }
export interface LoginRequest { email: string; password: string; }
export interface UpdateProfileRequest { firstName?: string; lastName?: string; phone?: string; }
export interface ChangePasswordRequest { currentPassword: string; newPassword: string; }

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['User', 'Profile'],
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<AuthResponse>, RegisterRequest>({
      query: (body) => ({ url: '/users/register', method: 'POST', body }),
    }),
    login: builder.mutation<ApiResponse<AuthResponse>, LoginRequest>({
      query: (body) => ({ url: '/users/login', method: 'POST', body }),
      invalidatesTags: ['User', 'Profile'],
    }),
    logout: builder.mutation<ApiResponse, void>({
      query: () => ({ url: '/users/logout', method: 'POST' }),
      invalidatesTags: ['User', 'Profile'],
    }),
    forgotPassword: builder.mutation<ApiResponse, { email: string }>({
      query: (body) => ({ url: '/users/forgot-password', method: 'POST', body }),
    }),
    verifyResetOtp: builder.mutation<ApiResponse<{ resetToken: string }>, { email: string; otp: string }>({
      query: (body) => ({ url: '/users/verify-reset-otp', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<ApiResponse, { token: string; newPassword: string }>({
      query: (body) => ({ url: '/users/reset-password', method: 'POST', body }),
    }),
    changePassword: builder.mutation<ApiResponse, ChangePasswordRequest>({
      query: (body) => ({ url: '/users/change-password', method: 'POST', body }),
    }),
    getProfile: builder.query<ApiResponse<{ user: User }>, void>({
      query: () => '/users/profile',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<ApiResponse<{ user: User }>, UpdateProfileRequest>({
      query: (body) => ({ url: '/users/profile', method: 'PUT', body }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const {
  useRegisterMutation, useLoginMutation, useLogoutMutation,
  useForgotPasswordMutation, useVerifyResetOtpMutation,
  useResetPasswordMutation, useChangePasswordMutation,
  useGetProfileQuery, useUpdateProfileMutation,
} = userApi;
