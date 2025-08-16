import React from "react";
import { Stack } from "expo-router";
import { ThemeProvider } from "@shopify/restyle";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {StatusBar} from "react-native";
import Toast from "react-native-toast-message";
import 'react-native-url-polyfill/auto';
import HydrationGate from "src/components/HydrationGate";
import {
  ThemeProvider as NavigationThemeProvider,
  DarkTheme as NavDark,
  DefaultTheme as NavLight,
  Theme as NavTheme,
} from '@react-navigation/native';
import {useThemePref} from "src/store/theme";


const qc = new QueryClient();
// optional: small palette tweak so backgrounds look iOS-y
const makeTheme = (base: NavTheme, overrides: Partial<NavTheme['colors']>): NavTheme => ({
  ...base,
  colors: { ...base.colors, ...overrides },
});

export default function RootLayout() {
  const { effective } = useThemePref(); // 'light' | 'dark'
  const { top } = useSafeAreaInsets();
  const navTheme = React.useMemo<NavTheme>(() => {
    return effective === 'dark'
      ? makeTheme(NavDark, {
        background: '#000', // screen bg
        card: '#111',       // header / bars
        border: '#1C1C1D',
        primary: '#0A84FF',
        text: '#FFF',
      })
      : makeTheme(NavLight, {
        background: '#F2F2F7',
        card: '#FFF',
        border: '#E5E5EA',
        primary: '#007AFF',
        text: '#000',
      });
  }, [effective]);

  return (
    <HydrationGate>
      <QueryClientProvider client={qc}>
        <NavigationThemeProvider value={navTheme}>
        <StatusBar
          barStyle={effective === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={navTheme.colors.card}
        />
          <SafeAreaProvider>
              <Stack
                screenOptions={{
                  // header styling
                  headerStyle: { backgroundColor: navTheme.colors.card },
                  headerTintColor: navTheme.colors.text,
                  headerTitleStyle: { color: navTheme.colors.text },
                  title: '',
                  blurEffect: 'regular',
                  // screen background
                  contentStyle: { backgroundColor: navTheme.colors.background },
                  paddingTop: top,

                }}
              >
                <Stack.Screen
                  name="word-sheet"
                  options={{
                    presentation: 'formSheet',
                    animation: 'slide_from_bottom',
                    gestureDirection: 'vertical',
                    sheetGrabberVisible: true,
                    sheetInitialDetentIndex: 0,
                    sheetAllowedDetents: [0.5, 0.75, 1],
                    sheetCornerRadius: 20,
                    sheetExpandsWhenScrolledToEdge: true,
                    sheetElevation: 24,
                  }}
                />
              </Stack>
          </SafeAreaProvider>
        </NavigationThemeProvider>
      </QueryClientProvider>
      <Toast />
    </HydrationGate>
  );
}
