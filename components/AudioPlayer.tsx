// components/AudioPlayer.tsx
import useAudioController from "@/hooks/useAudioController";
import { getPlayerState } from "@/store/player";
import AppLink from "@/ui/AppLink";
import AppModal from "@/ui/AppModal";
import Loader from "@/ui/Loader";
import PlayPauseBtn from "@/ui/PlayPauseBtn";
import PlaybackRateSelector from "@/ui/PlaybackRateSelector";
import PlayerControler from "@/ui/PlayerControler";
import colors from "@/utils/colors";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import formatDuration from "format-duration";
import { FC, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useSelector } from "react-redux";
import AudioInfoContainer from "./AudioInfoContainer";

interface Props {
  visible: boolean;
  onRequestClose(): void;
  onListOptionPress?(): void;
  onProfileLinkPress?(): void;
}

const formatTime = (ms = 0) => formatDuration(ms, { leading: true }) || "0:00";

const AudioPlayer: FC<Props> = ({
  visible,
  onRequestClose,
  onListOptionPress,
  onProfileLinkPress,
}) => {
  const [showAudioInfo, setShowAudioInfo] = useState(false);

  const { onGoingAudio, positionMillis, durationMillis, isPlaying, isBusy } =
    useSelector(getPlayerState);

  const {
    togglePlayPause,
    onNext: onNextPress,
    onPrevious: onPreviousPress,
    seekTo,
    skipTo,
  } = useAudioController();

  const poster = onGoingAudio?.poster;
  const source = poster ? { uri: poster } : require("../assets/music.png");

  if (!onGoingAudio) return null;

  return (
    <AppModal animation visible={visible} onRequestClose={onRequestClose}>
      <View style={styles.container}>
        {/* Bouton info (ferme le modal et ouvre les infos) */}
        <Pressable
          onPress={() => setShowAudioInfo(true)}
          style={styles.infoBtn}
        >
          <MaterialIcons name="info" size={26} color={colors.CONTRAST} />
        </Pressable>

        <AudioInfoContainer
          visible={showAudioInfo}
          closeHandler={() => setShowAudioInfo(false)}
        />

        {/* Poster */}
        <Image source={source} style={styles.poster} />

        {/* Titre + artiste */}
        <View style={styles.contentContainer}>
          <Text numberOfLines={2} style={styles.title}>
            {onGoingAudio.title}
          </Text>
          <AppLink
            onPress={onProfileLinkPress}
            title={onGoingAudio.owner.name}
            //textStyle={styles.artist}
          />

          {/* Temps actuel / durée */}
          <View style={styles.durationContainer}>
            <Text style={styles.durationText}>
              {formatTime(positionMillis)}
            </Text>
            <Text style={styles.durationText}>
              {formatTime(durationMillis)}
            </Text>
          </View>

          {/* Barre de progression */}
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={durationMillis || 1}
            value={positionMillis}
            minimumTrackTintColor={colors.SECONDARY}
            maximumTrackTintColor={colors.INACTIVE_CONTRAST + "60"}
            thumbTintColor={colors.SECONDARY}
            onSlidingComplete={seekTo}
          />

          {/* Contrôles */}
          <View style={styles.controls}>
            {/* Previous */}
            <PlayerControler onPress={onPreviousPress} ignoreContainer>
              <MaterialIcons
                name="skip-previous"
                size={36}
                color={colors.CONTRAST}
              />
            </PlayerControler>

            {/* -10s */}
            <PlayerControler onPress={() => skipTo(-10)} ignoreContainer>
              <MaterialCommunityIcons
                name="rewind-10"
                size={30}
                color={colors.CONTRAST}
              />
              <Text style={styles.skipText}>-10s</Text>
            </PlayerControler>

            {/* Play / Pause */}
            <PlayerControler>
              {isBusy ? (
                <Loader size={40} color={colors.PRIMARY} />
              ) : (
                <PlayPauseBtn
                  playing={isPlaying}
                  onPress={togglePlayPause}
                  //  size={72}
                  color={colors.PRIMARY}
                />
              )}
            </PlayerControler>

            {/* +10s */}
            <PlayerControler onPress={() => skipTo(10)} ignoreContainer>
              <MaterialCommunityIcons
                name="fast-forward-10"
                size={30}
                color={colors.CONTRAST}
              />
              <Text style={styles.skipText}>+10s</Text>
            </PlayerControler>

            {/* Next */}
            <PlayerControler onPress={onNextPress} ignoreContainer>
              <MaterialIcons
                name="skip-next"
                size={36}
                color={colors.CONTRAST}
              />
            </PlayerControler>
          </View>

          {/* Vitesse de lecture */}
          <PlaybackRateSelector
            onPress={(rate) => {}}
            // activeRate={1.0}
            containerStyle={styles.rateSelector}
          />

          {/* Bouton playlist */}
          <View style={styles.listBtnContainer}>
            <PlayerControler onPress={onListOptionPress} ignoreContainer>
              <MaterialCommunityIcons
                name="playlist-play"
                size={42}
                color={colors.SECONDARY}
              />
            </PlayerControler>
          </View>
        </View>
      </View>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
  },
  infoBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: colors.OVERLAY,
    borderRadius: 20,
  },
  poster: {
    width: 260,
    height: 260,
    borderRadius: 16,
    marginVertical: 30,
    backgroundColor: colors.OVERLAY,
  },
  contentContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.CONTRAST,
    textAlign: "center",
    marginBottom: 8,
  },
  artist: {
    fontSize: 16,
    color: colors.SECONDARY,
    marginBottom: 20,
  },
  durationContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  durationText: {
    color: colors.CONTRAST,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  slider: {
    width: "100%",
    height: 40,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  skipText: {
    fontSize: 11,
    color: colors.CONTRAST,
    marginTop: 4,
    fontWeight: "600",
  },
  rateSelector: {
    marginTop: 30,
  },
  listBtnContainer: {
    marginTop: 30,
    alignItems: "center",
  },
});

export default AudioPlayer;
