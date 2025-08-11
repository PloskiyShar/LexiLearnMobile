import React from "react";
import { Stack } from "expo-router";
import { ThemeProvider } from "../src/theme/theme";
import { lightTheme, darkTheme, Box } from "../src/theme/theme";
import { useThemeStore } from "../src/store/theme";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
    <QueryClientProvider client={qc}>
      <ThemeProvider theme={mode === "dark" ? darkTheme : lightTheme}>
        <SafeAreaProvider>
          <Shell />
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
