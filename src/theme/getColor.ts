import {Appearance, Platform, PlatformColor} from "react-native";

export function getColor(name: string, fallbackLight: string, fallbackDark?: string) {
  // Use PlatformColor on iOS; otherwise fallback
  if (Platform.OS === 'ios' && typeof PlatformColor === 'function') {
    try {
      return PlatformColor(name) as any;
    } catch {}
  }
  const scheme = Appearance.getColorScheme() ?? 'light';
  return scheme === 'dark' ? (fallbackDark ?? fallbackLight) : fallbackLight;
}