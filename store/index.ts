import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";
import notificationReducer from "./notification";
import playerReducer from "./player";
import playlistModalReducer from "./playlistModal";
import profileReducer from "./profile";

const reducer = combineReducers({
  auth: authReducer,
  notification: notificationReducer,
  player: playerReducer,
  playlistModal: playlistModalReducer,
  profile: profileReducer,
});

const store = configureStore({
  reducer,
});

export type RootState = ReturnType<typeof store.getState>;

export default store;
