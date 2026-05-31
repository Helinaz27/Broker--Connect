import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { API_BASE_URL } from '../../constants/api';

export interface Payment {
  id: string;
  amountBirr: number;
  coinsReceived: number;
  status: string;
  transactionId: string;
  createdAt: string;
}

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Payment'],
  endpoints: (builder) => ({
    getMyPayments: builder.query<
      { success: boolean; data: { payments: Payment[]; pagination: any } },
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: '/payments/my-payments', params: params ?? {} }),
      providesTags: ['Payment'],
    }),
    getCoinBalance: builder.query<
      { success: boolean; data: { coins: number } }, void
    >({
      query: () => '/payments/check-balance',
    }),
    getMyTransactions: builder.query<
      { success: boolean; data: { transactions: any[]; pagination: any } },
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: '/coin-transactions/my-transactions', params: params ?? {} }),
    }),
  }),
});

export const {
  useGetMyPaymentsQuery,
  useGetCoinBalanceQuery,
  useGetMyTransactionsQuery,
} = paymentApi;
