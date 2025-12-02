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
  token: getToken(), // may be null
  // getUser() returns unknown|null — coerce safely to User | null
  user: (getUser() as User | null) ?? null,
  loading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Set authentication state.
     * Accepts token (string|null) and user (User|null).
     * - token=null means "no token" (also clears storage).
     * - user=null means "no user" (also clears storage).
     */
    setAuth(
      _state,
      action: PayloadAction<{ token: string | null; user: User | null }>
    ) {
      const { token, user } = action.payload;

      // update state
      _state.token = token;
      _state.user = user;

      // persist — keep storage helpers responsible for normalization
      if (token) setToken(token);
      else clearToken();

      if (user) setUser(user);
      else clearUser();
    },

    /** Clear auth fully (state + storage) */
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
