import * as React from "react";
import { type ViewStyle, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Box, Text, useTheme } from "@/src/theme/theme";
import type { Theme } from "@/src/theme/theme";
import { TouchableOpacity } from "react-native";


const iconFor = (name: string) => {
  switch (name) {
    case "index":
      return "home-outline";
    case "stats":
      return "stats-chart-outline";
    case "exchange":
      return "swap-horizontal-outline";
    case "wallet":
      return "wallet-outline";
    case "settings":
      return "settings-outline";
    default:
      return "ellipse-outline";
  }
};

export default function CustomTabBar({
                                       state,
                                       descriptors,
                                       navigation,
                                     }: BottomTabBarProps) {
  const t = useTheme();
  const { bottom } = useSafeAreaInsets();

  // use theme KEYS (Restyle expects keys, not hex)
  const bgKey: keyof Theme["colors"] = "card";
  const borderKey: keyof Theme["colors"] = "border";
  const activeKey: keyof Theme["colors"] = "primary";
  const fgKey: keyof Theme["colors"] = "mutedForeground";

  return (
    <Box
      position="absolute"
      left={16}
      right={16}
      bottom={bottom}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      bg={bgKey}
      borderRadius="xl"
      style={{
        borderWidth: 1,
        height: 70,
        borderColor: t.colors[borderKey],
        shadowColor: "#000",
        shadowOpacity: 0.25,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const isPrimaryLook = isFocused; // <- active tab gets the pill
        const onPress = () => {
          if (!isFocused) navigation.navigate(route.name as never);
        };

        // normal tab
        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={{ flex: 1,  }}
            hitSlop={8}
          >
            <Box
              flex={1}
              alignItems="center"
              justifyContent="center"
              bg={isFocused ? "primary" : "transparent"}
              borderRadius="xl" // keep pill look
            >
              <Ionicons
                name={iconFor(route.name)}
                size={28}
                color={isFocused ? t.colors.background : t.colors.mutedForeground}
              />
            </Box>
          </TouchableOpacity>
        );
      })}
    </Box>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  } as ViewStyle,
  tabItemPrimary: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  } as ViewStyle,
});