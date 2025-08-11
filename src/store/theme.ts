import { create } from "zustand";
type Mode = "light" | "dark";
export const useThemeStore = create<{ mode: Mode; set: (m: Mode) => void; toggle: () => void }>((set, get) => ({
  mode: "dark",
  set: (m) => set({ mode: m }),
  toggle: () => set({ mode: get().mode === "dark" ? "light" : "dark" }),
}));
