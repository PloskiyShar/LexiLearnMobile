// app/books.tsx
import * as React from 'react';
import { FlatList } from 'react-native';
import { Stack, router } from 'expo-router';

import { Box, Text, useTheme } from 'src/theme/theme';
import { useBooks, type Book } from 'src/store/books';
import Card from "src/components/Card";

export default function BooksScreen() {
  const theme = useTheme();
  const { books, removeBook } = useBooks();

  // turn the record into an array once
  const data = React.useMemo<Book[]>(
    () => Object.values(books ?? {}).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)),
    [books]
  );


// keep only first occurrence by title
  const uniqueBooks = data.filter(
    (b, index, self) =>
      index === self.findIndex((x) => x.title.trim().toLowerCase() === b.title.trim().toLowerCase())
  );

  const openBook = React.useCallback((id: string) => {
    router.push(`/reading/${id}`);
  }, []);

  const goAdd = React.useCallback(() => {
    router.push('/add-book');
  }, []);

  const renderItem = React.useCallback(
    ({ item }) => (
      <Card
        title={item.title}
        subtitle={item.author}
        right={`${Math.round((item.progress ?? 0) * 100)}%`}
        onPress={() => openBook(item.id)}
        onDelete={() => removeBook(item.id)}
      />
    ),
    [openBook]
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Bookshelf', headerLargeTitle: true }} />
      <Box flex={1} bg="background">
        <FlatList
          data={uniqueBooks}
          keyExtractor={(b) => b.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <Box height={16} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 32}}
          ListEmptyComponent={
            <Box flex={1} ai="center" jc="center" py="xl">
              <Box as={/* Touchable */ 'div'} />
              <Box mt="md">
                <Card title="Add a book" onPress={goAdd} />
              </Box>
            </Box>
          }
        />
      </Box>
    </>
  );
}
