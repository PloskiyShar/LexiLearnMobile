import React from "react";
import { Box, Text, useTheme } from "../../src/theme/theme";
import { LinearGradient } from "expo-linear-gradient";

const Card: React.FC<React.PropsWithChildren> = ({ children }) => {
  const t = useTheme();
  return (
    <Box bg="card" borderWidth={1} borderColor="border" borderRadius="xl" p="md">{children}</Box>
  );
};

export default function Home() {
  const t = useTheme();
  return (
    <Box flex={1} bg="background">
      {/* rounded gradient header */}
      <Box height={220} borderBottomLeftRadius="xl" borderBottomRightRadius="xl" overflow="hidden">
        <LinearGradient
          colors={[t.colors.background, t.colors.primary, t.colors.background]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        />
      </Box>

      <Box p="md" gap="md">
        <Card>
          <Text variant="muted">Movement Index</Text>
          <Text variant="heading">58</Text>
        </Card>

        <Text variant="muted" marginTop="md">Timeline</Text>
        <Card><Text>Stress</Text></Card>
        <Card><Text>Plain Yogurt, Strawberries</Text></Card>
      </Box>
    </Box>
  );
}
