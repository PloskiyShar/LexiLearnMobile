import React from "react";
import { Box, Text, useTheme } from "../../src/theme/theme";
import { LinearGradient } from "expo-linear-gradient";

const Card: React.FC<React.PropsWithChildren> = ({ children }) => {
  const t = useTheme();
  return (
    <Box bg="card" borderWidth={1} borderColor="border" borderRadius="xl" p="md">{children}</Box>
  );
};

export default function Exchange() {
  const t = useTheme();
  return (
    <Box flex={1} bg="background">

      <Box p="md" gap="md">
        <Text variant="muted" marginTop="md">Exchange</Text>
      </Box>
    </Box>
  );
}
