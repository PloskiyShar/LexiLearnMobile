import React from "react";
import { TouchableOpacity } from "react-native";
import { Box, Text } from "../theme/theme";

type Props = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  children?: React.ReactNode;
};

export default function Card({ title, subtitle, onPress, right, children }: Props) {
  const Container: any = onPress ? TouchableOpacity : Box;
  return (
    <Box bg="card" borderRadius="xl" style={{ borderWidth: 1 }} borderColor="border" overflow="hidden">
      <Container onPress={onPress} style={{ padding: 16 }}>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Text variant="heading">{title}</Text>
            {subtitle ? <Text color="mutedForeground">{subtitle}</Text> : null}
          </Box>
          {right}
        </Box>
        {children}
      </Container>
    </Box>
  );
}
