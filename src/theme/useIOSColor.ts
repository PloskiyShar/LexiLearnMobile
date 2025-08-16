import {useThemePref} from "src/store/theme";

const iosLight = {
  background: '#FFFFFF',                 // systemBackground
  secondaryBackground: '#F2F2F7',        // secondarySystemBackground
  groupedBackground: '#F2F2F7',          // systemGroupedBackground
  secondaryGroupedBackground: '#FFFFFF', // secondarySystemGroupedBackground
  label: '#000000',                       // label
  secondaryLabel: '#3C3C4399',            // secondaryLabel (approx 60% opacity)
  tertiaryLabel: '#3C3C434D',             // tertiaryLabel (approx 30% opacity)
  separator: '#3C3C4349',                 // separator (light grey line)
  tint: '#007AFF',                        // systemBlue
  destructive: '#FF3B30',                 // systemRed
};

const iosDark = {
  background: '#000000',                 // systemBackground
  secondaryBackground: '#1C1C1E',        // secondarySystemBackground
  groupedBackground: '#000000',          // systemGroupedBackground
  secondaryGroupedBackground: '#1C1C1E', // secondarySystemGroupedBackground
  label: '#FFFFFF',                       // label
  secondaryLabel: '#EBEBF599',            // secondaryLabel (approx 60% opacity)
  tertiaryLabel: '#EBEBF54D',             // tertiaryLabel (approx 30% opacity)
  separator: '#54545899',                 // separator
  tint: '#0A84FF',                        // systemBlue (dark mode variant)
  destructive: '#FF453A',                 // systemRed (dark mode variant)
};


const androidFallback = {
  background: '#fff',
  secondaryBackground: '#f2f2f7',
  groupedBackground: '#f2f2f7',
  secondaryGroupedBackground: '#fff',
  label: '#000',
  secondaryLabel: '#666',
  tertiaryLabel: '#999',
  separator: '#d9d9d9',
  tint: '#0a84ff',
  destructive: '#ff3b30',
};

export function useIOSColors() {
  // simple dynamic palette to mimic grouped iOS lists
  const {effective} = useThemePref()
  const isDark = effective === 'dark'
  return {
    screenBg: isDark ? '#000000' : '#F2F2F7',
    groupBg: isDark ? '#1C1C1E' : '#FFFFFF',
    separator: isDark ? '#2C2C2E' : '#C6C6C8',
    label: isDark ? '#FFFFFF' : '#000000',
    value: '#8E8E93',
    ...(isDark ? iosDark : iosLight)
  }
}