import { getClient } from "@/api/client";
import { useFetchIsFavorite } from "@/hooks/query";
import useAudioController from "@/hooks/useAudioController";
import { getPlayerState } from "@/store/player";
import Loader from "@/ui/Loader";
import PlayPauseBtn from "@/ui/PlayPauseBtn";
import colors from "@/utils/colors";
import { mapRange } from "@/utils/math";
import { useRouter } from "expo-router";
import { FC, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useMutation, useQueryClient } from "react-query";
import { useSelector } from "react-redux";
import AudioPlayer from "./AudioPlayer";
import CurrentAudioList from "./CurrentAudioList";

export const MiniPlayerHeight = 60;

const MiniAudioPlayer: FC = () => {
  const { onGoingAudio, positionMillis, durationMillis, isPlaying, isBusy } =
    useSelector(getPlayerState);
  const { togglePlayPause } = useAudioController();
  const router = useRouter();

  const [playerVisibility, setPlayerVisibility] = useState(false);
  const [showCurrentList, setShowCurrentList] = useState(false);

  const { data: isFav } = useFetchIsFavorite(onGoingAudio?.id || "");
  const queryClient = useQueryClient();

  // Calcul du pourcentage de progression
  const progressPercentage =
    durationMillis > 0
      ? mapRange({
          inputValue: positionMillis,
          inputMin: 0,
          inputMax: durationMillis,
          outputMin: 0,
          outputMax: 100,
        })
      : 0;

  const poster = onGoingAudio?.poster;
  const source = poster ? { uri: poster } : require("../assets/music.png");

  const toggleIsFav = async (id: string) => {
    if (!id) return;
    const client = await getClient();
    await client.post("/favorite?audioId=" + id);
  };

  const favoriteMutation = useMutation({
    mutationFn: toggleIsFav,
    onMutate: (id: string) => {
      queryClient.setQueryData<boolean>(
        ["favorite", onGoingAudio?.id],
        (old) => !old
      );
    },
  });

  if (!onGoingAudio) return null;

  return (
    <>
      {/* Barre de progression fine en haut */}
      <View style={styles.progressContainer}>
        <View
          style={[styles.progressBar, { width: `${progressPercentage}%` }]}
        />
      </View>

      {/* Mini player */}
      <View style={styles.container}>
        <Image source={source} style={styles.poster} />

        <Pressable
          onPress={() => setPlayerVisibility(true)}
          style={styles.contentContainer}
        >
          <Text numberOfLines={1} style={styles.title}>
            {onGoingAudio.title}
          </Text>
          <Text numberOfLines={1} style={styles.name}>
            {onGoingAudio.owner.name}
          </Text>
        </Pressable>

        {/* Bouton favori */}
        {/* <Pressable
          onPress={() => favoriteMutation.mutate(onGoingAudio.id)}
          style={styles.favoriteBtn}
        >
          <MaterialIcons
            name={isFav ? "favorite" : "favorite-border"}
            size={28}
            color={isFav ? "#FF3B30" : colors.CONTRAST}
          />
        </Pressable> */}

        {/* Play/Pause */}
        {isBusy ? (
          <Loader size={32} color={colors.SECONDARY} />
        ) : (
          <PlayPauseBtn playing={isPlaying} onPress={togglePlayPause} />
        )}
      </View>

      {/* Full player modal */}
      <AudioPlayer
        visible={playerVisibility}
        onRequestClose={() => setPlayerVisibility(false)}
        onListOptionPress={() => {
          setPlayerVisibility(false);
          setShowCurrentList(true);
        }}
        onProfileLinkPress={() => {
          setPlayerVisibility(false);
          // navigation ici si besoin
          //router.push(`/public-profile/${onGoingAudio?.owner?.id}` as any);
        }}
      />

      <CurrentAudioList
        visible={showCurrentList}
        onRequestClose={() => setShowCurrentList(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    height: 2.5,
    width: "100%",
    backgroundColor: colors.INACTIVE_CONTRAST + "40",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.ACCENT,
    borderRadius: 2,
  },
  container: {
    width: "100%",
    height: MiniPlayerHeight,
    backgroundColor: colors.PRIMARY,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: colors.INACTIVE_CONTRAST + "30",
  },
  poster: {
    height: MiniPlayerHeight - 16,
    width: MiniPlayerHeight - 16,
    borderRadius: 8,
    backgroundColor: colors.OVERLAY,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  title: {
    color: colors.CONTRAST,
    fontWeight: "700",
    fontSize: 15,
  },
  name: {
    color: colors.SECONDARY,
    fontSize: 13,
    marginTop: 2,
  },
  favoriteBtn: {
    padding: 8,
  },
});

export default MiniAudioPlayer;
