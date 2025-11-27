// store/slices/profileSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from ".";

interface ProfileState {
  currentId: string | null;
}

const initialState: ProfileState = {
  currentId: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setCurrentProfileId: (state, action: PayloadAction<string>) => {
      state.currentId = action.payload;
    },
    clearCurrentProfileId: (state) => {
      state.currentId = null;
    },
  },
});

export const { setCurrentProfileId, clearCurrentProfileId } =
  profileSlice.actions;

// GETTERS (selecteurs) — à utiliser partout dans l’app
export const selectCurrentProfileId = (state: RootState) =>
  state.profile.currentId;

export const selectIsOwnProfile = (state: RootState, userId: string) =>
  state.profile.currentId === userId;

export const getProfileProfile = (state: RootState) => state.profile;

export const getCurrentId = (state: RootState) => state.profile.currentId;

export default profileSlice.reducer;
