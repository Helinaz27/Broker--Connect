// store/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: string[];
  coins: number;
  isActive: boolean;
  isKYCVerified: boolean;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  currentUser: null,
  token: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, updateUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
