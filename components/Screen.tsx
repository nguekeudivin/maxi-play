import useAudioController from "@/hooks/useAudioController";
import colors from "@/utils/colors";
import { FC, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MiniAudioPlayer from "./MiniAudioPlayer";
import PlaylistAudioModal from "./PlaylistAudioModal";

interface Props {
  children: ReactNode;
}

const Screen: FC<Props> = ({ children }) => {
  const { isPalyerReady } = useAudioController();
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.children}>{children}</View>
        {isPalyerReady ? <MiniAudioPlayer /> : null}
        <PlaylistAudioModal />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, // REQUIRED!!!
    backgroundColor: colors.PRIMARY,
  },
  container: {
    flex: 1,
  },
  children: {
    flex: 1,
  },
});

export default Screen;
