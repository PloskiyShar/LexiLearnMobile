import React from "react";
import { Box, Text } from "../../src/theme/theme";
import { useThemeStore } from "../../src/store/theme";
import { TouchableOpacity } from "react-native";

const Btn: React.FC<{ onPress: () => void; label: string }> = ({ onPress, label }) => (
  <TouchableOpacity onPress={onPress} style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, backgroundColor: "#00000010" }}>
    <Text>{label}</Text>
  </TouchableOpacity>
);

export default function Settings() {
  const mode = useThemeStore((s) => s.mode);
  const set = useThemeStore((s) => s.set);
  const toggle = useThemeStore((s) => s.toggle);

  return (
    <Box flex={1} bg="background" p="md" gap="lg">
      <Text variant="heading">Settings</Text>
      <Text variant="muted">Current theme: {mode}</Text>

      <Box flexDirection="row" gap="md" marginTop="md">
        <Btn onPress={toggle} label="Toggle" />
        <Btn onPress={() => set("light")} label="Light" />
        <Btn onPress={() => set("dark")} label="Dark" />
      </Box>
    </Box>
  );
}
