// example /src/features/users/usersSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  name: string;
  email: string;
}

interface UsersState {
  list: User[];
  loading: boolean;
}

const initialState: UsersState = { list: [], loading: false };

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
      state.list = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setUsers, setLoading } = usersSlice.actions;

// <-- Add this default export so `import usersReducer from ".../usersSlice"` works:
export default usersSlice.reducer;
