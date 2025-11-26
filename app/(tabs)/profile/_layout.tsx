import ProfileHeader from "@/components/profile/ProfileHeader";
import colors from "@/utils/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import Screen from "@/components/Screen";
import { StyleSheet, View } from "react-native";

export default function ProfileLayout() {
  return (
    <Screen>
      {/* Fixed Header */}
      <View style={styles.header}>
        <ProfileHeader />
      </View>

      {/* ⭐ Tabs MUST NOT be wrapped in any View */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarActiveTintColor: colors.SECONDARY,
          tabBarInactiveTintColor: "rgba(255,255,255,0.5)",
        }}
        initialRouteName="uploads"
      >
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

        {/* <Tabs.Screen
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
        /> */}
      </Tabs>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.PRIMARY,
  },
  header: {
    height: 100, // adjust to your design
    backgroundColor: colors.PRIMARY,
  },
  tabBar: {
    backgroundColor: colors.PRIMARY,
    elevation: 0,
    borderBottomWidth: 0,
    height: 56,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
});
