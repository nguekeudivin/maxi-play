import colors from "@/utils/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function ProfileLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.PRIMARY, // primary color background
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
        tabBarActiveTintColor: colors.CONTRAST,
        tabBarInactiveTintColor: "rgba(255,255,255,0.6)",
        headerStyle: {
          backgroundColor: colors.PRIMARY, // header background
        },
        headerTintColor: "white", // text & back button color
        headerTitleStyle: {
          fontWeight: "bold",
        },
        //tabBarShowIcon: true,
      }}
    >
      {/* Main Profile header */}
      <Tabs.Screen name="index" options={{ href: null }} />

      {/* Profile tabs */}
      <Tabs.Screen
        name="uploads"
        options={{
          title: "Uploads",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="cloud-upload" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="playlist"
        options={{
          title: "Playlist",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="queue-music" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="favorite" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="history" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
