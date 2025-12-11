import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../api/baseApi";
import authReducer from "../features/auth/authSlice";
import parcelsReducer from "../features/parcels/parcelsSlice";
import usersReducer from "../features/users/usersSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    parcels: parcelsReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
