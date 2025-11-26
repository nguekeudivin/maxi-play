import colors from "@/utils/colors";
import { useRouter } from "expo-router";
import { FC } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

interface Props {
  title?: string;
  route?: string;
  onPress?(): void;
  active?: boolean;
}

const AppLink: FC<Props> = ({ route, title, active = true, onPress }) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={
        active
          ? () => {
              if (route) router.push(route as any);
              else if (onPress) onPress();
            }
          : null
      }
      style={{ opacity: active ? 1 : 0.4 }}
    >
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  title: {
    color: colors.SECONDARY,
    fontSize: 18,
  },
});

export default AppLink;
