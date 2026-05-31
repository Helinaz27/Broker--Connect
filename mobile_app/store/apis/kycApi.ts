import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { API_BASE_URL } from '../../constants/api';

export type DocumentType = 'national_id' | 'passport' | 'driving_license';
export type KYCStatus = 'pending' | 'approved' | 'rejected';

export interface MyKYCStatusData {
  kycSubmitted: boolean;
  status: KYCStatus | null;
  documentType?: DocumentType;
  submittedAt?: string;
  reason?: string;
}

export const kycApi = createApi({
  reducerPath: 'kycApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['MyKYC'],
  endpoints: (builder) => ({
    getMyKYCStatus: builder.query<{ success: boolean; data: MyKYCStatusData }, void>({
      query: () => '/kyc/my-status',
      providesTags: ['MyKYC'],
    }),
    submitKYC: builder.mutation<{ success: boolean; message: string }, FormData>({
      query: (formData) => ({
        url: '/kyc/submit',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['MyKYC'],
    }),
  }),
});

export const { useGetMyKYCStatusQuery, useSubmitKYCMutation } = kycApi;
