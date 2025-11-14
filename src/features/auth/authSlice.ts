// src/features/auth/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  getToken,
  getUser,
  setToken,
  setUser,
  clearToken,
  clearUser,
} from "../../lib/storage";
import type { User } from "../../types";

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
}

const initialState: AuthState = {
  token: getToken(),
  user: (getUser() as User) ?? null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ token: string; user: User }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      setToken(action.payload.token);
      setUser(action.payload.user);
    },
    clearAuthState(state) {
      state.token = null;
      state.user = null;
      clearToken();
      clearUser();
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setAuth, clearAuthState, setLoading } = authSlice.actions;
export default authSlice.reducer;
