import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "./apis/userApi";
import { listingsApi } from "./apis/listingsApi";
import { chatApi } from "./apis/chatApi";
import { notificationApi } from "./apis/notificationApi";
import { paymentApi } from "./apis/paymentApi";
import { kycApi } from "./apis/kycApi";
import { accessApi } from "./apis/accessApi";
import { adminApi } from "./apis/adminApi";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    [userApi.reducerPath]: userApi.reducer,
    [listingsApi.reducerPath]: listingsApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [kycApi.reducerPath]: kycApi.reducer,
    [accessApi.reducerPath]: accessApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(listingsApi.middleware)
      .concat(chatApi.middleware)
      .concat(notificationApi.middleware)
      .concat(paymentApi.middleware)
      .concat(kycApi.middleware)
      .concat(accessApi.middleware)
      .concat(adminApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
