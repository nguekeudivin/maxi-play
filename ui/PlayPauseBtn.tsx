import colors from "@/utils/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { FC } from "react";
import { Pressable, StyleSheet } from "react-native";

interface Props {
  color?: string;
  playing?: boolean;
  onPress?(): void;
}

const PlayPauseBtn: FC<Props> = ({
  color = colors.CONTRAST,
  playing,
  onPress,
}) => {
  return (
    <Pressable onPress={onPress} style={styles.button} hitSlop={10}>
      {playing ? (
        <MaterialIcons name="pause" size={32} color={color} />
      ) : (
        <MaterialIcons name="play-arrow" size={32} color={color} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PlayPauseBtn;
