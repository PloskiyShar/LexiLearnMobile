// src/theme/shadow.ts
import { Platform, type ViewStyle } from "react-native";

const iosShadow = (opacity: number, radius: number, height: number): ViewStyle => ({
  shadowColor: "#000",
  shadowOpacity: opacity,
  shadowRadius: radius,
  shadowOffset: { width: 0, height },
});

export const shadow = {
  sm: Platform.select<ViewStyle>({
    ios: iosShadow(0.12, 6, 2),
    android: { elevation: 2 },
    default: {},                // keeps TS happy on web/native
  })!,
  md: Platform.select<ViewStyle>({
    ios: iosShadow(0.18, 10, 4),
    android: { elevation: 4 },
    default: {},
  })!,
  lg: Platform.select<ViewStyle>({
    ios: iosShadow(0.24, 16, 8),
    android: { elevation: 8 },
    default: {},
  })!,
};
