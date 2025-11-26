import { Stack } from "expo-router";
import { StyleSheet } from "react-native";

export default function AuthLayout() {
  return (
    // <SafeAreaView style={styles.container} edges={["top", "bottom"]}>

    // </SafeAreaView>

    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // or your theme background
  },
});
