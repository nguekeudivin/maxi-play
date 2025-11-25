import { Stack } from "expo-router";

export default function HomeStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" /> {/* Home */}
      <Stack.Screen name="public-profile" /> {/* Public profile */}
    </Stack>
  );
}
