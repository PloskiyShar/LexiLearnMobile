// app/books.tsx
import React from 'react';
import { FlatList, View, StyleSheet, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import Cell from 'src/ios/Cell';

import { useBooks, type Book } from 'src/store/books';
import Card from "src/components/Card";
import {useIOSColors} from "src/theme/useIOSColor";

export default function BooksScreen() {
  const { books, currentId, setCurrent, removeBook } = useBooks();
  const c = useIOSColors()

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

  const currentBook = (currentId ? books[currentId] : undefined) || uniqueBooks?.[0]
  const otherBooks = uniqueBooks.filter((b) => b.id !== currentId);


  const openBook = React.useCallback((id: string) => {
    setCurrent(id);
    router.push(`/reading/${id}`);
  }, []);

  const goAdd = React.useCallback(() => {
    router.push('/add-book');
  }, []);

  const confirmDelete = (b: Book) =>
    Alert.alert('Delete Book', `Delete “${b.title}”?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeBook(b.id) },
    ]);

  return (
    <>
      <Stack.Screen options={{
        title: 'Books',
        headerLargeTitle: true,            // iOS large title
        headerTransparent: true,           // looks like Apple apps
        headerBlurEffect: 'regular',       // iOS 15+ blur
        headerShadowVisible: false,
        headerTintColor: c.label as any,
      }}/>
      <View style={[styles.screen, { backgroundColor: c.groupedBackground as any }]}>
        {/* Section: Currently Reading */}
        {currentBook ? (
          <View style={[styles.group, { backgroundColor: c.secondaryGroupedBackground as any }]}>
            <Cell
              title={currentBook.title}
              subtitle={`${Math.round((currentBook.progress ?? 0) * 100)}% read`}
              onLongPress={() => confirmDelete(currentBook)}
              onPress={() => openBook(currentBook?.id)}
            />
          </View>
        ) : (
          <View style={[styles.group, { backgroundColor: c.secondaryGroupedBackground as any }]}>
            <Cell
              title={"No book currently reading. Add?"}
              onPress={goAdd}
            />
          </View>
        )}

        {/* Section: Library */}
        <View style={{ height: 24 }} />
        <View style={[styles.group, { backgroundColor: c.secondaryGroupedBackground as any }]}>
          <FlatList
            data={otherBooks}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={[styles.sep, {backgroundColor: c.separator as any,}]} />}
            renderItem={({ item }) => (
              <Cell
                title={item.title}
                subtitle={`${Math.round((item.progress ?? 0) * 100)}% read`}
                onPress={() => openBook(item.id)}
                onLongPress={() => confirmDelete(item.id, item.title)}
              />
            )}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 12 },
  group: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#00000020',
  },
  sep: {
    height: StyleSheet.hairlineWidth,
  },
});