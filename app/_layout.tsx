import React from "react";
import { Stack } from "expo-router";
import { ThemeProvider } from "@shopify/restyle";
import { lightTheme, darkTheme, Box } from "src/theme/theme";
import { useThemeStore } from "src/store/theme";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {StatusBar} from "react-native";
import Toast from "react-native-toast-message";
import 'react-native-url-polyfill/auto';
import HydrationGate from "src/components/HydrationGate";


const qc = new QueryClient();

function Shell() {
  const { top } = useSafeAreaInsets();
  return (
    <Box flex={1} bg="background" style={{ paddingTop: top }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }} />
    </Box>
  );
}

export default function RootLayout() {
  const mode = useThemeStore((s) => s.mode);
  return (
    <HydrationGate>
      <QueryClientProvider client={qc}>
        <ThemeProvider theme={mode === "dark" ? darkTheme : lightTheme}>
          <StatusBar
            barStyle={mode !== "dark" ? "dark-content" : "light-content"}
            backgroundColor={mode !== "dark" ? "#fff" : "#000"}
          />
          <SafeAreaProvider>
            <Shell />
          </SafeAreaProvider>
        </ThemeProvider>
      </QueryClientProvider>
      <Toast />
    </HydrationGate>
  );
}
