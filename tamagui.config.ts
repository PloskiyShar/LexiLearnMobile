import { createTamagui } from "tamagui";
import { themes, tokens } from "@tamagui/themes";

const config = createTamagui({
  defaultTheme: "dark",
  themes: {
    ...themes,
    dark: {
      ...themes.dark,
      background: "#0B0B0B",
      backgroundStrong: "#121212",
      color: "#ECECEC",
      color2: "#9A9A9A",
      borderColor: "rgba(255,255,255,0.06)",
    },
    light: {
      ...themes.light,
      background: "#FFFFFF",
      backgroundStrong: "#F5F5F7",
      color: "#111111",
      color2: "#666666",
      borderColor: "rgba(0,0,0,0.06)",
    },
  },
  tokens: {
    ...tokens,
    radius: { ...tokens.radius, 12: 16, 16: 24, 20: 28 },
  },
  shorthands: { p: "padding", m: "margin", f: "flex", ai: "alignItems", jc: "justifyContent", br: "borderRadius" },
});

export default config;

type AppConfig = typeof config;
declare module "tamagui" { interface TamaguiCustomConfig extends AppConfig {} }
