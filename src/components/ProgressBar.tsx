import React from "react";
import { Box } from "../theme/theme";
import { ViewStyle } from "react-native";

export default function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <Box
      height={10}
      bg="muted"
      borderRadius="md"
      overflow="hidden"
    >
      <Box
        style={[{ width: `${v * 100}%`, height: "100%" } as ViewStyle]}
        bg="primary"
        height="100%"
      />
    </Box>

  );
}
