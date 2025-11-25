import useAudioController from "@/hooks/useAudioController";
import { getPlayerState, updatePlaybackRate } from "@/store/player";
import AppLink from "@/ui/AppLink";
import AppModal from "@/ui/AppModal";
import Loader from "@/ui/Loader";
import PlayPauseBtn from "@/ui/PlayPauseBtn";
import PlaybackRateSelector from "@/ui/PlaybackRateSelector";
import PlayerControler from "@/ui/PlayerControler";
import colors from "@/utils/colors";
import Slider from "@react-native-community/slider";
import { MaterialDesignIcons } from "@react-native-vector-icons/material-design-icons";
import formatDuration from "format-duration";
import { FC, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AudioInfoContainer from "./AudioInfoContainer";
import { IconSymbol } from "./ui/icon-symbol";

interface Props {
  visible: boolean;
  onRequestClose(): void;
  onListOptionPress?(): void;
  onProfileLinkPress?(): void;
}

const fromattedDuration = (duration = 0) => {
  return formatDuration(duration, {
    leading: true,
  });
};

const AudioPlayer: FC<Props> = ({
  visible,
  onListOptionPress,
  onRequestClose,
  onProfileLinkPress,
}) => {
  const [showAudioInfo, setShowAudioInfo] = useState(false);
  const { onGoingAudio, playbackRate } = useSelector(getPlayerState);
  const {
    isPalying,
    isBusy,
    onNextPress,
    onPreviousPress,
    seekTo,
    skipTo,
    togglePlayPause,
    setPlaybackRate,
  } = useAudioController();
  const poster = onGoingAudio?.poster;
  const source = poster ? { uri: poster } : require("../assets/music.png");

  const duration = 0;
  const position = 0;

  const dispatch = useDispatch();

  const handleOnNextPress = async () => {
    await onNextPress();
  };

  const handleOnPreviousPress = async () => {
    await onPreviousPress();
  };

  const updateSeek = async (value: number) => {
    await seekTo(value);
  };

  const handleSkipTo = async (skipType: "forward" | "reverse") => {
    if (skipType === "forward") await skipTo(10);
    if (skipType === "reverse") await skipTo(-10);
  };

  const onPlaybacRatekPress = async (rate: number) => {
    await setPlaybackRate(rate);
    dispatch(updatePlaybackRate(rate));
  };

  return (
    <AppModal animation visible={visible} onRequestClose={onRequestClose}>
      <View style={styles.container}>
        <Pressable
          onPress={() => setShowAudioInfo(true)}
          style={styles.infoBtn}
        >
          <IconSymbol name="house.fill" color={colors.CONTRAST} size={24} />
        </Pressable>
        <AudioInfoContainer
          visible={showAudioInfo}
          closeHandler={setShowAudioInfo}
        />
        <Image source={source} style={styles.poster} />
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{onGoingAudio?.title}</Text>

          <AppLink
            onPress={onProfileLinkPress}
            title={onGoingAudio?.owner.name || ""}
          />

          <View style={styles.durationContainer}>
            <Text style={styles.duration}>
              {fromattedDuration(position * 1000)}
            </Text>
            <Text style={styles.duration}>
              {fromattedDuration(duration * 1000)}
            </Text>
          </View>

          <Slider
            minimumValue={0}
            maximumValue={duration}
            minimumTrackTintColor={colors.CONTRAST}
            maximumTrackTintColor={colors.INACTIVE_CONTRAST}
            value={position}
            onSlidingComplete={updateSeek}
          />

          <View style={styles.controles}>
            {/* Previous */}
            <PlayerControler onPress={handleOnPreviousPress} ignoreContainer>
              <IconSymbol name="house.fill" size={24} color={colors.CONTRAST} />
            </PlayerControler>

            {/* Skip Time Left */}
            <PlayerControler
              onPress={() => handleSkipTo("reverse")}
              ignoreContainer
            >
              <IconSymbol
                name="house.fill"
                //name="rotate-left"
                size={18}
                color={colors.CONTRAST}
              />
              <Text style={styles.skipText}>-10s</Text>
            </PlayerControler>

            {/* Play Pause */}
            <PlayerControler>
              {isBusy ? (
                <Loader color={colors.PRIMARY} />
              ) : (
                <PlayPauseBtn
                  playing={isPalying}
                  onPress={togglePlayPause}
                  color={colors.PRIMARY}
                />
              )}
            </PlayerControler>

            {/* Skip Time Right */}
            <PlayerControler
              onPress={() => handleSkipTo("forward")}
              ignoreContainer
            >
              <IconSymbol name="house.fill" size={18} color={colors.CONTRAST} />

              <Text style={styles.skipText}>+10s</Text>
            </PlayerControler>

            {/* Next */}
            <PlayerControler onPress={handleOnNextPress} ignoreContainer>
              <IconSymbol name="house.fill" size={24} color={colors.CONTRAST} />
            </PlayerControler>
          </View>

          <PlaybackRateSelector
            onPress={onPlaybacRatekPress}
            activeRate={playbackRate.toString()}
            containerStyle={{ marginTop: 20 }}
          />

          <View style={styles.listOptionBtnContainer}>
            <PlayerControler onPress={onListOptionPress} ignoreContainer>
              <MaterialDesignIcons
                name="playlist-music"
                size={24}
                color={colors.CONTRAST}
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
    padding: 20,
  },
  poster: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  contentContainer: {
    width: "100%",
    flex: 1,
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.CONTRAST,
  },
  durationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  duration: {
    color: colors.CONTRAST,
  },
  controles: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  skipText: {
    fontSize: 12,
    marginTop: 2,
    color: colors.CONTRAST,
  },
  infoBtn: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  listOptionBtnContainer: {
    alignItems: "flex-end",
  },
});

export default AudioPlayer;
