import { AudioData } from "@/@types/audio";
import {
  getPlayerState,
  updateOnGoingAudio,
  updateOnGoingList,
} from "@/store/player";
import deepEqual from "deep-equal";
import { Audio } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const useAudioController = () => {
  const soundRef = useRef<Audio.Sound | null>(null);

  const [isPalying, setIsPalying] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const dispatch = useDispatch();
  const { onGoingAudio, onGoingList } = useSelector(getPlayerState);

  // Expo AV is ready immediately
  const isPalyerReady = true;

  // -------- Helper: Load & Play a Track -------- //
  const loadAndPlay = async (item: AudioData) => {
    setIsBusy(true);

    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: item.file },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setIsPalying(true);
      dispatch(updateOnGoingAudio(item));
    } catch (e) {
      console.log("Audio load error:", e);
    }

    setIsBusy(false);
  };

  // -------- Main handler: onAudioPress -------- //
  const onAudioPress = async (item: AudioData, list: AudioData[]) => {
    const sameList = deepEqual(onGoingList, list);
    const sameAudio = onGoingAudio?.id === item.id;

    // First play ever
    if (!soundRef.current) {
      dispatch(updateOnGoingList(list));
      return await loadAndPlay(item);
    }

    // Pause same audio
    if (isPalying && sameAudio) {
      await soundRef.current.pauseAsync();
      setIsPalying(false);
      return;
    }

    // Resume same audio
    if (!isPalying && sameAudio) {
      await soundRef.current.playAsync();
      setIsPalying(true);
      return;
    }

    // New audio inside same list
    if (sameList && !sameAudio) {
      return await loadAndPlay(item);
    }

    // New audio from new list
    dispatch(updateOnGoingList(list));
    return await loadAndPlay(item);
  };

  // -------- Play / Pause toggle -------- //
  const togglePlayPause = async () => {
    if (!soundRef.current) return;

    if (isPalying) {
      await soundRef.current.pauseAsync();
      setIsPalying(false);
    } else {
      await soundRef.current.playAsync();
      setIsPalying(true);
    }
  };

  // -------- Seek -------- //
  const seekTo = async (position: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(position);
  };

  // -------- Skip forward/backward (seconds) -------- //
  const skipTo = async (sec: number) => {
    if (!soundRef.current) return;

    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;

    await soundRef.current.setPositionAsync(status.positionMillis + sec * 1000);
  };

  // -------- Playback rate -------- //
  const setPlaybackRate = async (rate: number) => {
    if (!soundRef.current) return;
    await soundRef.current.setRateAsync(rate, true);
  };

  // -------- Next audio -------- //
  const onNextPress = async () => {
    if (!onGoingList || !onGoingAudio) return;
    const index = onGoingList.findIndex((a) => a.id === onGoingAudio.id);
    const next = onGoingList[index + 1];

    if (next) await loadAndPlay(next);
  };

  // -------- Previous audio -------- //
  const onPreviousPress = async () => {
    if (!onGoingList || !onGoingAudio) return;
    const index = onGoingList.findIndex((a) => a.id === onGoingAudio.id);
    const prev = onGoingList[index - 1];

    if (prev) await loadAndPlay(prev);
  };

  // -------- Cleanup -------- //
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // -------- Return same API as TrackPlayer version -------- //
  return {
    onAudioPress,
    onNextPress,
    onPreviousPress,
    seekTo,
    togglePlayPause,
    setPlaybackRate,
    skipTo,
    isBusy,
    isPalyerReady,
    isPalying,
  };
};

export default useAudioController;
