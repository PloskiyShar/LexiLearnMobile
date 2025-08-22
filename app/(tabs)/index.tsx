// app/index.tsx
import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import { Stack, router } from 'expo-router';
import { useBooks } from 'src/store/books';
import Cell from 'src/ios/Cell';
import {useIOSColors} from "src/theme/useIOSColor";
import { useReview } from '@/src/store/review';


export default function HomeScreen() {
  const { books, currentId } = useBooks();
  const currentBook = currentId ? books[currentId] : undefined;
  const c = useIOSColors()
  const review = useReview();
  const dueCount = review.getDueKeys().length;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Home',
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: 'regular',
          headerShadowVisible: false,
          headerTintColor: c.label as any,
        }}
      />
      <View style={[styles.screen, { backgroundColor: c.groupedBackground as any }]}>
        <View style={[styles.group, { backgroundColor: c.secondaryGroupedBackground as any }]}>
          {currentBook && (<Cell
            title={currentBook ? currentBook.title : 'Currently Reading'}
            subtitle={currentBook ? `${Math.round(100 / currentBook.totalPages * currentBook.currentPage)}% read` : 'No book selected'}
            onPress={() => {
              if (currentBook) router.push(`/reading/${currentBook.id}`);
            }}
          />)}
          <View style={[styles.sep, {backgroundColor: c.separator as any,}]} />
          <Cell
            title="Add New Book"
            onPress={() => router.push('/add-book')}
          />
          <View style={[styles.sep, {backgroundColor: c.separator as any,}]} />
          <Cell
            title="Words to Review"
            onPress={() => router.push('/review')}
            right={dueCount > 0 ? <View
              style={{
                backgroundColor: c.destructive,
                marginTop: 4,
                borderRadius: 12,
                minWidth: 24,
                paddingHorizontal: 6,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: 'white' }}>
                {dueCount}
              </Text>
            </View> : null}
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
