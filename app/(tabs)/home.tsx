// app/home.tsx (ou app/index.tsx si c’est ta page d’accueil)
import { AudioData, Playlist } from "@/@types/audio";
import catchAsyncError from "@/api/catchError";
import { getClient } from "@/api/client";
import { queryClient } from "@/api/query-client";
import LatestUploads from "@/components/LatestUploads";
import OptionsModal from "@/components/OptionsModal";
import PlaylistForm, { PlaylistInfo } from "@/components/PlaylistForm";
import PlayListModal from "@/components/PlaylistModal";
import RecentlyPlayed from "@/components/RecentlyPlayed";
import RecommendedAudios from "@/components/RecommendedAudios";
import Screen from "@/components/Screen";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useFetchPlaylist } from "@/hooks/query";
import useAudioController from "@/hooks/useAudioController";
import { upldateNotification } from "@/store/notification";
import colors from "@/utils/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { FC, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useDispatch } from "react-redux";

const REFRESH_THRESHOLD = 130; // pixels à tirer pour déclencher le refresh

const Home: FC = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<AudioData | undefined>();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showPlaylistForm, setShowPlaylistForm] = useState(false);

  const { onAudioPress } = useAudioController();
  const { data: playlists = [] } = useFetchPlaylist();
  const dispatch = useDispatch();

  // Animation du pull-to-refresh
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const isRefreshing = useSharedValue(false);

  const triggerRefresh = async () => {
    if (isRefreshing.value) return;
    isRefreshing.value = true;
    rotation.value = withTiming(720, { duration: 900 });

    try {
      //await queryClient.refetchQueries({ active: true });
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return [
            "latest-uploads",
            "recommended-audios",
            "recommended-playlists",
            "recently-played",
            "playlists",
          ].includes(key as string);
        },
      });
    } catch (error) {
      dispatch(
        upldateNotification({ message: "Refresh failed", type: "error" })
      );
    } finally {
      isRefreshing.value = false;
      translateY.value = withSpring(0);
      rotation.value = 0;
    }
  };

  // Gesture : long press + pan down
  const longPressAndPan = Gesture.LongPress()
    .minDuration(400)
    .onStart(() => {
      translateY.value = withSpring(80);
    })
    .onFinalize(() => {
      if (translateY.value < REFRESH_THRESHOLD * 0.7) {
        translateY.value = withSpring(0);
      }
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = Math.min(e.translationY, REFRESH_THRESHOLD + 60);
      }
    })
    .onEnd(() => {
      if (translateY.value >= REFRESH_THRESHOLD) {
        triggerRefresh();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const gesture = Gesture.Simultaneous(longPressAndPan, pan);

  const spinnerStyle = useAnimatedStyle(() => ({
    opacity: translateY.value > 50 ? 1 : 0,
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Handlers
  const handleOnLongPress = (audio: AudioData) => {
    setSelectedAudio(audio);
    setShowOptions(true);
  };

  const handleOnAddToPlaylist = () => {
    setShowOptions(false);
    setShowPlaylistModal(true);
  };

  const handlePlaylistSubmit = async (info: PlaylistInfo) => {
    if (!info.title.trim() || !selectedAudio) return;

    try {
      const client = await getClient();
      await client.post("/playlist/create", {
        resId: selectedAudio.id,
        title: info.title,
        visibility: info.private ? "private" : "public",
      });
      dispatch(
        upldateNotification({ message: "Playlist created!", type: "success" })
      );
      setShowPlaylistForm(false);
      setSelectedAudio(undefined);
    } catch (error) {
      const msg = catchAsyncError(error);
      dispatch(upldateNotification({ message: msg, type: "error" }));
    }
  };

  const handleAddToExistingPlaylist = async (playlist: Playlist) => {
    if (!selectedAudio) return;

    try {
      const client = await getClient();
      await client.patch("/playlist", {
        id: playlist.id,
        item: selectedAudio.id,
        title: playlist.title,
        visibility: playlist.visibility,
      });
      dispatch(
        upldateNotification({ message: "Added to playlist!", type: "success" })
      );
      setShowPlaylistModal(false);
      setSelectedAudio(undefined);
    } catch (error) {
      const msg = catchAsyncError(error);
      dispatch(upldateNotification({ message: msg, type: "error" }));
    }
  };

  return (
    <Screen>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[{ flex: 1 }, contentStyle]}>
          {/* Spinner du refresh */}
          <Animated.View style={[styles.refreshSpinner, spinnerStyle]}>
            <MaterialIcons name="refresh" size={36} color={colors.SECONDARY} />
          </Animated.View>

          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
              <RecentlyPlayed />
            </View>

            <View style={styles.section}>
              <LatestUploads
                onAudioPress={onAudioPress}
                onAudioLongPress={handleOnLongPress}
              />
            </View>

            <View style={styles.section}>
              <RecommendedAudios
                onAudioPress={onAudioPress}
                onAudioLongPress={handleOnLongPress}
              />
            </View>
            {/* 
            <View style={styles.section}>
              <RecommendedPlaylist
                onListPress={(playlist) => {
                  dispatch(updateSelectedListId(playlist.id));
                  dispatch(updatePlaylistVisbility(true));
                }}
              />
            </View> */}
          </ScrollView>

          {/* Modales */}
          <OptionsModal
            visible={showOptions}
            onRequestClose={() => {
              setShowOptions(false);
              setSelectedAudio(undefined);
            }}
            options={[
              {
                title: "Add to playlist",
                icon: "playlist-plus",
                onPress: handleOnAddToPlaylist,
              },
            ]}
            renderItem={(item) => (
              <Pressable onPress={item.onPress} style={styles.optionItem}>
                <IconSymbol
                  name={item.icon as any}
                  size={24}
                  color={colors.PRIMARY}
                />
                <Text style={styles.optionText}>{item.title}</Text>
              </Pressable>
            )}
          />

          <PlayListModal
            visible={showPlaylistModal}
            onRequestClose={() => {
              setShowPlaylistModal(false);
              setSelectedAudio(undefined);
            }}
            list={playlists}
            onCreateNewPress={() => {
              setShowPlaylistModal(false);
              setShowPlaylistForm(true);
            }}
            onPlaylistPress={handleAddToExistingPlaylist}
          />

          <PlaylistForm
            visible={showPlaylistForm}
            onRequestClose={() => {
              setShowPlaylistForm(false);
              setSelectedAudio(undefined);
            }}
            onSubmit={handlePlaylistSubmit}
          />
        </Animated.View>
      </GestureDetector>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 100,
    paddingTop: 0,
  },
  section: {
    marginBottom: 24,
  },
  refreshSpinner: {
    position: "absolute",
    top: 90,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  optionText: {
    color: colors.PRIMARY,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "600",
  },
});

export default Home;
