// app/reading/[id].tsx
import * as React from 'react';
import { View, Text, ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent, Platform, PlatformColor, Appearance } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useBooks } from '../../src/store/books';
import BackButton from "src/components/BackButton";
import {getColor} from "src/theme/getColor";
import {useIOSColors} from "src/theme/useIOSColor";

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { books, setCurrent, updateProgress, setLocation } = useBooks() as any;
  const c = useIOSColors()

  const book = id ? books?.[id] : undefined;
  const content = typeof book?.content === 'string' ? book.content : '';

  const scrollRef = React.useRef<ScrollView>(null);
  const [layoutH, setLayoutH] = React.useState(0);
  const [contentH, setContentH] = React.useState(0);
  const restoredRef = React.useRef(false);

  React.useEffect(() => {
    if (id) setCurrent(id);
  }, [id, setCurrent]);

  const tryRestore = React.useCallback(() => {
    if (!book || restoredRef.current || !layoutH || !contentH) return;
    const denom = Math.max(1, contentH - layoutH);
    const savedOffset = typeof book.location?.offset === 'number' ? book.location.offset : undefined;
    const fromProgress = typeof book.progress === 'number' ? book.progress * denom : 0;
    const y = Math.max(0, Math.min(typeof savedOffset === 'number' ? savedOffset : fromProgress, denom));
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y, animated: false });
      restoredRef.current = true;
    });
  }, [book, layoutH, contentH]);

  React.useEffect(() => {
    tryRestore();
  }, [tryRestore, content]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!book) return;
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const denom = Math.max(1, contentSize.height - layoutMeasurement.height);
    const ratio = Math.max(0, Math.min(1, contentOffset.y / denom));

    if (typeof updateProgress === 'function') updateProgress(book.id, ratio);
    if (typeof setLocation === 'function') setLocation(book.id, { offset: contentOffset.y });
  };

  if (!book) {
    return (
      <>
        <Stack.Screen options={{ title: 'Reading' }} />
        <View style={[styles.center, { backgroundColor: getColor('systemBackground', '#fff', '#000') }]}>
          <Text style={{ color: getColor('secondaryLabel', '#666', '#aaa') }}>No book found.</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: book.title ?? 'Reading',
          headerLargeTitle: false,
          headerShadowVisible: false,
          headerTintColor: c.label as any,
          headerTransparent: false,
          headerStyle: { backgroundColor: c.background },
          headerShown: true,
          headerLeft: () => <BackButton />,
        }}
      />
      <View
        style={[styles.container, { backgroundColor: c.background, color: c.label }]}
        onLayout={(e) => setLayoutH(e.nativeEvent.layout.height)}
      >
        <ScrollView
          ref={scrollRef}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onContentSizeChange={(_w, h) => setContentH(h)}
          contentContainerStyle={styles.readerContent}
        >
          <Text style={{
            color: c.label,
            fontSize: 18,
          }}>
            {book.content || 'No content available.'}
          </Text>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 , fontSize: 50 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  readerContent: { paddingHorizontal: 18, paddingVertical: 16 },
});
