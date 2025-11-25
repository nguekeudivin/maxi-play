import colors from "@/utils/colors";
import { MaterialIcons } from "@expo/vector-icons"; // or use Ionicons, FontAwesome, etc.
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.PRIMARY, // tab bar background
          borderTopWidth: 0, // remove top border
        },
        tabBarActiveTintColor: colors.CONTRAST, // active tab text/icon
        tabBarInactiveTintColor: "rgba(255,255,255,0.5)", // inactive color
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="cloud-upload" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
