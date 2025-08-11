import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TamaguiProvider, Theme, YStack } from "tamagui";
import config from "../tamagui.config";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

const qc = new QueryClient();

export default function RootLayout() {
  const scheme = "dark";
  const isDark = true; // default to dark if unknown
  const BG = isDark ? "#0B0B0B" : "#FFFFFF";

  return (
    <QueryClientProvider client={qc}>
      <TamaguiProvider config={config} defaultTheme={isDark ? "dark" : "light"}>
        <Theme name={isDark ? "dark" : "light"}>
          {/* Theme-aware screen background */}
          <YStack f={1} bg="$background">
            <StatusBar style={isDark ? "light" : "dark"} backgroundColor={BG} />
            <Stack
              screenOptions={{
                headerShown: false,
                // important: gives every screen the same bg as Tamagui
                contentStyle: { backgroundColor: BG },
              }}
            />
          </YStack>
        </Theme>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
