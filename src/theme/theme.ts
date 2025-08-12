import {
  createTheme,
  createBox,
  createText,
  ThemeProvider,
  useTheme as useRTheme,
} from "@shopify/restyle";
import { formatHex, oklch as toOklch } from "culori";

// convert OKLCH -> hex
const hex = (v: string) => (v.startsWith("oklch") ? formatHex(toOklch(v)) : v);

// ---- palettes from your CSS ----
const lightRaw = {
  background: "oklch(0.9885 0.0057 84.5659)",
  foreground: "oklch(0.3660 0.0251 49.6085)",
  card: "oklch(0.9686 0.0091 78.2818)",
  cardForeground: "oklch(0.3660 0.0251 49.6085)",
  primary: "oklch(0.5553 0.1455 48.9975)",
  primaryForeground: "oklch(1 0 0)",
  secondary: "oklch(0.8276 0.0752 74.4400)",
  secondaryForeground: "oklch(0.4444 0.0096 73.6390)",
  muted: "oklch(0.9363 0.0218 83.2637)",
  mutedForeground: "oklch(0.5534 0.0116 58.0708)",
  accent: "oklch(0.9000 0.0500 74.9889)",
  accentForeground: "oklch(0.4444 0.0096 73.6390)",
  destructive: "oklch(0.4437 0.1613 26.8994)",
  destructiveForeground: "oklch(1 0 0)",
  border: "oklch(0.8866 0.0404 89.6994)",
  transparent: "transparent"
};
const darkRaw = {
  background: "oklch(0.2161 0.0061 56.0434)",
  foreground: "oklch(0.9699 0.0013 106.4238)",
  card: "oklch(0.2685 0.0063 34.2976)",
  cardForeground: "oklch(0.9699 0.0013 106.4238)",
  primary: "oklch(0.7049 0.1867 47.6044)",
  primaryForeground: "oklch(1 0 0)",
  secondary: "oklch(0.4444 0.0096 73.6390)",
  secondaryForeground: "oklch(0.9232 0.0026 48.7171)",
  muted: "oklch(0.2685 0.0063 34.2976)",
  mutedForeground: "oklch(0.7161 0.0091 56.2590)",
  accent: "oklch(0.3598 0.0497 229.3202)",
  accentForeground: "oklch(0.9232 0.0026 48.7171)",
  destructive: "oklch(0.5771 0.2152 27.3250)",
  destructiveForeground: "oklch(1 0 0)",
  border: "oklch(0.3741 0.0087 67.5582)",
  transparent: "transparent"
};

const L = Object.fromEntries(Object.entries(lightRaw).map(([k, v]) => [k, hex(v)])) as Record<string, string>;
const D = Object.fromEntries(Object.entries(darkRaw).map(([k, v]) => [k, hex(v)])) as Record<string, string>;

export const lightTheme = createTheme({
  colors: {
    ...L,
  },
  spacing: { none: 0, xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  borderRadii: { none: 0, sm: 4, md: 8, lg: 16, xl: 24 },
  textVariants: {
    defaults: { color: "foreground", fontSize: 16 },
    heading: { color: "foreground", fontSize: 28, fontWeight: "700" },
    muted: { color: "mutedForeground", fontSize: 14 },
  },
});
export const darkTheme = {
  ...lightTheme,
  colors: { ...D },
};

export type Theme = typeof lightTheme;
export const Box = createBox<Theme>();
export const Text = createText<Theme>();
export const useTheme = () => useRTheme<Theme>();

export { ThemeProvider };
