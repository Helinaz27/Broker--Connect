import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../apis/userApi';

interface UserState {
  currentUser: User | null;
  token: string | null;
}

const initialState: UserState = {
  currentUser: null,
  token: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.token = action.payload.token;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.token = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;