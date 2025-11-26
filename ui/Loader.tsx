// components/ui/loader.tsx
import colors from "@/utils/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { FC, useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface Props {
  size?: number;
  color?: string;
}

const Loader: FC<Props> = ({ size = 28, color = colors.SECONDARY }) => {
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000 }), // 1 tour par seconde
      -1, // infini
      false
    );
  }, []);

  return (
    <Animated.View style={animatedStyle}>
      <MaterialIcons name="sync" size={size} color={color} />
    </Animated.View>
  );
};

export default Loader;
