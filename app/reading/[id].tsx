import React, { useMemo } from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import { ScrollView } from "react-native";
import { Box, Text } from "../../src/theme/theme";
import { useBooks } from "../../src/store/books";

export default function Reading() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { books } = useBooks();
  const book = useMemo(() => (id ? books[id] : undefined), [books, id]);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: book?.title ?? "Reading", tabBarStyle: { display: "none" } }} />
      <Box flex={1} bg="background">
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text variant="heading">{book?.title}</Text>
          {!!book?.author && <Text color="mutedForeground" marginBottom="md">{book.author}</Text>}
          {book?.content ? (
            <Text>{book.content}</Text>
          ) : (
            <Text color="mutedForeground">No content imported yet.</Text>
          )}
        </ScrollView>
      </Box>
    </>
  );
}
