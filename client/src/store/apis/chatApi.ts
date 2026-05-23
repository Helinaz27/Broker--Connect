import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

export interface OtherUser {
  id: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  listingId: string;
  messageType: "text" | "image" | "file";
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
  otherUser: OtherUser;
  lastMessage: ChatMessage | null;
  unreadCount: number;
}

export interface InitiateChatResponse {
  room: ChatRoom;
  messages: ChatMessage[];
  otherUser: OtherUser;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  nextCursor: string | null;
}

export interface RoomsResponse {
  rooms: ChatRoom[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UploadResponse {
  urls: string[];
}

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["ChatRooms", "Messages"],
  endpoints: (builder) => ({
    initiateChat: builder.mutation<
      { success: boolean; data: InitiateChatResponse },
      { listingId: string; otherUserId: string }
    >({
      query: (body) => ({ url: "/chat/initiate", method: "POST", body }),
      invalidatesTags: ["ChatRooms"],
    }),

    getChatRooms: builder.query<
      { success: boolean; data: RoomsResponse },
      { page?: number; limit?: number }
    >({
      query: (params) => ({ url: "/chat/rooms", params }),
      providesTags: ["ChatRooms"],
    }),

    searchContacts: builder.query<
      { success: boolean; data: (OtherUser & { roomId: string })[] },
      string
    >({
      query: (q) => ({ url: "/chat/rooms/search", params: { q } }),
    }),

    getMessages: builder.query<
      { success: boolean; data: MessagesResponse },
      { roomId: string; cursor?: string; limit?: number }
    >({
      query: ({ roomId, ...params }) => ({
        url: `/chat/rooms/${roomId}/messages`,
        params,
      }),
      providesTags: (_result, _err, { roomId }) => [
        { type: "Messages", id: roomId },
      ],
    }),

    uploadMessageFile: builder.mutation<
      { success: boolean; data: UploadResponse },
      { roomId: string; files: FormData }
    >({
      query: ({ roomId, files }) => ({
        url: `/chat/rooms/${roomId}/upload`,
        method: "POST",
        body: files,
      }),
    }),
  }),
});

export const {
  useInitiateChatMutation,
  useGetChatRoomsQuery,
  useSearchContactsQuery,
  useGetMessagesQuery,
  useUploadMessageFileMutation,
} = chatApi;
