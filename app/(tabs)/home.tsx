// app/home.tsx
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
import colors from "@/utils/colors";
import { useFocusEffect } from "expo-router";
import { FC, useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

const Home: FC = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<AudioData | undefined>();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showPlaylistForm, setShowPlaylistForm] = useState(false);

  const { onAudioPress } = useAudioController();
  const { data: playlists = [] } = useFetchPlaylist();

  useFocusEffect(
    useCallback(() => {
      queryClient.refetchQueries({ queryKey: ["recommanded"] });
    }, [])
  );

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

      Toast.show({
        type: "success",
        text1: "Playlist created!",
        text2: `"${info.title}" has been created successfully`,
        position: "top",
        visibilityTime: 4000,
      });

      setShowPlaylistForm(false);
      setSelectedAudio(undefined);
    } catch (error) {
      const msg = catchAsyncError(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: msg,
        position: "top",
        visibilityTime: 5000,
      });
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

      Toast.show({
        type: "success",
        text1: "Added to playlist!",
        text2: `Track added to "${playlist.title}"`,
        position: "top",
        visibilityTime: 4000,
      });

      setShowPlaylistModal(false);
      setSelectedAudio(undefined);
    } catch (error) {
      const msg = catchAsyncError(error);
      Toast.show({
        type: "error",
        text1: "Failed to add",
        text2: msg,
        position: "top",
        visibilityTime: 5000,
      });
    }
  };

  const handleOnFavPress = async () => {
    if (!selectedAudio) return;

    try {
      const client = await getClient();

      await client.post("/favorite?audioId=" + selectedAudio.id);

      Toast.show({
        type: "success",
        text1: "Added to favorites!",
        text2: `"${selectedAudio.title}" is now in your favorites`,
        position: "top",
        visibilityTime: 4000,
      });
    } catch (error) {
      const errorMessage = catchAsyncError(error);
      Toast.show({
        type: "error",
        text1: "Failed to add to favorites",
        text2: errorMessage,
        position: "top",
        visibilityTime: 5000,
      });
    }

    setSelectedAudio(undefined);
    setShowOptions(false);
  };

  return (
    <Screen>
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
          {
            title: "Add to favorite",
            icon: "favorite",
            onPress: handleOnFavPress,
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
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
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
function fetchRecommended() {
  throw new Error("Function not implemented.");
}
