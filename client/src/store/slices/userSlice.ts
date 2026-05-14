import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../apis/userApi";

interface UserState {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const loadState = (): UserState => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("userState");
      if (saved) return JSON.parse(saved);
    } catch (err) {}
  }
  return { currentUser: null, token: null, isAuthenticated: false };
};

const userSlice = createSlice({
  name: "user",
  initialState: loadState(),
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("userState", JSON.stringify(state));
      }
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("userState", JSON.stringify(state));
      }
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("userState");
      }
    },
  },
});

export const { setUser, updateUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
