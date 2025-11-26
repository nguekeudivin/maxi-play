// hooks/useAudioController.ts
import { AudioData } from "@/@types/audio";
import audioPlayer from "@/store/audioPlayer";
import {
  getPlayerState,
  setIsBusy,
  setIsPlaying,
  setPlaybackPosition,
  updateOnGoingAudio,
  updateOnGoingList,
} from "@/store/player";
import { Audio, AVPlaybackStatus } from "expo-av";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useAudioController = () => {
  const dispatch = useDispatch();
  const player = useSelector(getPlayerState);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      dispatch(setIsPlaying(false));
      return;
    }

    dispatch(setIsPlaying(status.isPlaying));
    dispatch(
      setPlaybackPosition({
        position: status.positionMillis,
        duration: status.durationMillis || 0,
      })
    );

    if (status.didJustFinish) {
      onNext();
    }
  };

  const loadAndPlay = async (item: AudioData) => {
    dispatch(setIsBusy(true));

    try {
      await audioPlayer.unload();

      const { sound } = await Audio.Sound.createAsync(
        { uri: item.file },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      audioPlayer.setSound(sound);
      dispatch(updateOnGoingAudio(item));
    } catch (error) {
      console.error("Load failed:", error);
    } finally {
      dispatch(setIsBusy(false));
    }
  };

  const onAudioPress = async (item: AudioData, list: AudioData[]) => {
    const isSameAudio = player.onGoingAudio?.id === item.id;

    if (!audioPlayer.getSound()) {
      dispatch(updateOnGoingList(list));
      return await loadAndPlay(item);
    }

    if (isSameAudio) {
      if (player.isPlaying) {
        await audioPlayer.getSound()?.pauseAsync();
      } else {
        await audioPlayer.getSound()?.playAsync();
      }
      return;
    }

    dispatch(updateOnGoingList(list));
    await loadAndPlay(item);
  };

  const togglePlayPause = async () => {
    const sound = audioPlayer.getSound();
    if (!sound) return;
    if (player.isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const onNext = async () => {
    if (!player.onGoingList || !player.onGoingAudio) return;
    const index = player.onGoingList.findIndex(
      (a) => a.id === player.onGoingAudio!.id
    );
    const next = player.onGoingList[index + 1];
    if (next) await loadAndPlay(next);
  };

  const onPrevious = async () => {
    if (!player.onGoingList || !player.onGoingAudio) return;
    const index = player.onGoingList.findIndex(
      (a) => a.id === player.onGoingAudio!.id
    );
    const prev = player.onGoingList[index - 1];
    if (prev) await loadAndPlay(prev);
  };

  const seekTo = async (position: number) => {
    await audioPlayer.getSound()?.setPositionAsync(position);
  };

  const skipTo = async (seconds: number) => {
    const sound = audioPlayer.getSound();
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      const newPos = status.positionMillis + seconds * 1000;
      await sound.setPositionAsync(Math.max(0, newPos));
    }
  };

  // Nettoyage global
  useEffect(() => {
    return () => {
      audioPlayer.unload();
    };
  }, []);

  return {
    onAudioPress,
    togglePlayPause,
    onNext,
    onPrevious,
    seekTo,
    skipTo,
    ...player,
    isPlayerReady: true,
  };
};

export default useAudioController;
