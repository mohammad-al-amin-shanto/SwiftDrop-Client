// src/features/auth/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getToken,
  getUser,
  saveToken,
  saveUser,
  clearAuth,
} from "../../lib/storage";

interface AuthState {
  token: string | null;
  user: any | null;
  loading: boolean;
}

const initialState: AuthState = {
  token: getToken(),
  user: getUser(),
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ token: string; user: any }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      saveToken(action.payload.token);
      saveUser(action.payload.user);
    },
    clearAuthState(state) {
      state.token = null;
      state.user = null;
      clearAuth();
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setAuth, clearAuthState, setLoading } = authSlice.actions;
export default authSlice.reducer;
