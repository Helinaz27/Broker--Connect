import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { API_BASE_URL } from '../../constants/api';

export interface ContactAccess {
  id: string;
  coinsPaid: number;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    listingType: string;
    price: number;
    images: string[];
    location: any;
    owner: { phone: string; email: string; id: string };
  };
}

export const accessApi = createApi({
  reducerPath: 'accessApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['MyAccesses'],
  endpoints: (builder) => ({
    getMyAccesses: builder.query<
      { success: boolean; data: { accesses: ContactAccess[]; pagination: any } },
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: '/contact-access/my-accesses', params: params ?? {} }),
      providesTags: ['MyAccesses'],
    }),
    accessContact: builder.mutation<{ success: boolean; message: string }, { listingId: string }>({
      query: (body) => ({ url: '/contact-access/access', method: 'POST', body }),
      invalidatesTags: ['MyAccesses'],
    }),
  }),
});

export const { useGetMyAccessesQuery, useAccessContactMutation } = accessApi;
