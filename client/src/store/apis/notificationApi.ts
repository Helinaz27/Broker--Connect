import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  path: string | null;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  pagination: NotificationPagination;
}

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Notifications", "UnreadCount"],
  endpoints: (builder) => ({
    getMyNotifications: builder.query<
      { success: boolean; data: NotificationsResponse },
      { page?: number; limit?: number; isRead?: boolean }
    >({
      query: (params) => ({ url: "/notifications", params }),
      providesTags: ["Notifications"],
    }),

    getUnreadCount: builder.query<
      { success: boolean; data: { unreadCount: number } },
      void
    >({
      query: () => "/notifications/unread/count",
      providesTags: ["UnreadCount"],
    }),

    markAllAsRead: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({ url: "/notifications/read-all", method: "PUT" }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),

    markOneAsRead: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({ url: `/notifications/${id}/read`, method: "PUT" }),
      invalidatesTags: ["Notifications", "UnreadCount"],
    }),
  }),
});

export const {
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllAsReadMutation,
  useMarkOneAsReadMutation,
} = notificationApi;
