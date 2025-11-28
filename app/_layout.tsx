// app/_layout.tsx
import { queryClient } from "@/api/query-client";
import AppNotification from "@/components/AppNotification";
import store from "@/store";
import colors from "@/utils/colors";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { LogBox, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // ← AJOUTÉ
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { QueryClientProvider } from "react-query";
import { Provider } from "react-redux";

LogBox.ignoreAllLogs(true);

export default function RootLayout() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          {/* ← LE WRAP MAGIQUE QUI RÉSOUT TOUT */}
          <GestureHandlerRootView style={styles.gestureContainer}>
            <AppNotification />
            <StatusBar style="auto" />

            <Slot />

            <Toast />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </QueryClientProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  gestureContainer: {
    flex: 1,
    backgroundColor: colors.PRIMARY, // ton fond global
  },
});
