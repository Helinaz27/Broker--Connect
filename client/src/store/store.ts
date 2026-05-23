import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "./apis/userApi";
import { listingsApi } from "./apis/listingsApi";
import { adminApi } from "./apis/adminApi";
import { kycApi } from "./apis/kycApi";
import { accessApi } from "./apis/accessApi";
import { paymentApi } from "./apis/paymentApi";
import { platformFeeApi } from "./apis/platformFeeApi";
import { chatApi } from "./apis/chatApi";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    [userApi.reducerPath]: userApi.reducer,
    [listingsApi.reducerPath]: listingsApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [kycApi.reducerPath]: kycApi.reducer,
    [accessApi.reducerPath]: accessApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [platformFeeApi.reducerPath]: platformFeeApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(listingsApi.middleware)
      .concat(adminApi.middleware)
      .concat(kycApi.middleware)
      .concat(accessApi.middleware)
      .concat(paymentApi.middleware)
      .concat(platformFeeApi.middleware)
      .concat(chatApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
