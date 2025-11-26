// store/player.ts
import { AudioData } from "@/@types/audio";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Audio } from "expo-av";
import { RootState } from ".";

interface PlayerState {
  sound: Audio.Sound | null;
  onGoingAudio: AudioData | null;
  onGoingList: AudioData[];
  isPlaying: boolean;
  isBusy: boolean;
  playbackRate: number;
  positionMillis: number;
  durationMillis: number;
}

const initialState: PlayerState = {
  sound: null,
  onGoingAudio: null,
  onGoingList: [],
  isPlaying: false,
  isBusy: false,
  playbackRate: 1,
  positionMillis: 0,
  durationMillis: 0,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setSound: (state, action: PayloadAction<Audio.Sound | null>) => {
      state.sound = action.payload as any;
    },
    updateOnGoingAudio: (state, action: PayloadAction<AudioData | null>) => {
      state.onGoingAudio = action.payload;
    },
    updateOnGoingList: (state, action: PayloadAction<AudioData[]>) => {
      state.onGoingList = action.payload;
    },
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setIsBusy: (state, action: PayloadAction<boolean>) => {
      state.isBusy = action.payload;
    },
    setPlaybackPosition: (
      state,
      action: PayloadAction<{ position: number; duration: number }>
    ) => {
      state.positionMillis = action.payload.position;
      state.durationMillis = action.payload.duration;
    },
    resetPlayer: () => initialState,
  },
});

export const {
  setSound,
  updateOnGoingAudio,
  updateOnGoingList,
  setIsPlaying,
  setIsBusy,
  setPlaybackPosition,
  resetPlayer,
} = playerSlice.actions;

export const getPlayerState = (state: RootState) => state.player;

export default playerSlice.reducer;
