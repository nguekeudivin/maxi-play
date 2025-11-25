import colors from "@/utils/colors";
import { Tabs } from "expo-router";

export default function PublicProfileLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          marginBottom: 20,
          backgroundColor: "transparent",
          elevation: 0,
          shadowRadius: 0,
          shadowColor: "transparent",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          color: colors.CONTRAST,
          fontSize: 12,
        },
      }}
    >
      {/* index.tsx is the main header, hidden from tab */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="uploads" options={{ title: "Uploads" }} />
      <Tabs.Screen name="playlist" options={{ title: "Playlist" }} />
    </Tabs>
  );
}
