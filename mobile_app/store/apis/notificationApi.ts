import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { API_BASE_URL } from "../../constants/api";

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  path: string | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Notifications"],
  endpoints: (builder) => ({
    getMyNotifications: builder.query<
      {
        success: boolean;
        data: { notifications: AppNotification[]; pagination: any };
      },
      { page?: number; limit?: number; isRead?: boolean }
    >({
      query: (params) => ({ url: "/notifications", params }),
      providesTags: ["Notifications"],
    }),
    markAllAsRead: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: "/notifications/read-all", method: "PUT" }),
      invalidatesTags: ["Notifications"],
    }),
    markOneAsRead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PUT" }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useMarkAllAsReadMutation,
  useMarkOneAsReadMutation,
} = notificationApi;
