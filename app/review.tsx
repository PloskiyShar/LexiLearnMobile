import React from "react";
import { Box, Text } from "../src/theme/theme";
import { Stack } from "expo-router";
import { useBooks } from "../src/store/books";

export default function Review() {
  const { popDue } = useBooks();
  const [item, setItem] = React.useState(() => popDue());

  const next = () => setItem(popDue());

  return (
    <>
      <Stack.Screen options={{ title: "Review" }} />
      <Box flex={1} bg="background" padding="md" gap="lg" justifyContent="center">
        {item ? (
          <>
            <Text variant="heading">{item.text}</Text>
            {!!item.context && <Text color="mutedForeground">{item.context}</Text>}
            <Box flexDirection="row" gap="md">
              <Box asChild>
                <Text onPress={next} bg="primary" color="background" padding="md" borderRadius="md">Know it</Text>
              </Box>
              <Box asChild>
                <Text onPress={next} bg="card" color="foreground" padding="md" borderRadius="md" style={{ borderWidth: 1 }} borderColor="border">Again</Text>
              </Box>
            </Box>
          </>
        ) : (
          <Text color="mutedForeground">Nothing due right now.</Text>
        )}
      </Box>
    </>
  );
}
