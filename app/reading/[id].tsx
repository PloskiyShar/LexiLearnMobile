// app/reading/[id].tsx
import * as React from 'react';
import { ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Box, Text, useTheme } from '../../src/theme/theme';
import { useBooks } from '../../src/store/books';

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { books, setCurrent, updateProgress, setLocation } = useBooks() as any;
  const theme = useTheme();

  // book + content from store only
  const book = id ? books?.[id] : undefined;
  const content = (book?.content ?? '') as string;

  // sizes for restore
  const [layoutH, setLayoutH] = React.useState(0);
  const [contentH, setContentH] = React.useState(0);
  const scrollRef = React.useRef<ScrollView>(null);
  const restoredRef = React.useRef(false);

  // mark current
  React.useEffect(() => {
    if (id) setCurrent(id);
  }, [id, setCurrent]);

  // log if content missing
  React.useEffect(() => {
    if (!book) return;
    if (!content || content.trim().length === 0) {
      console.warn(`[Reader] Empty content for book "${book.title}" (id=${book.id}). Did you store 'content' when importing?`);
    }
  }, [book, content]);

  // try to restore scroll (once)
  const tryRestore = React.useCallback(() => {
    if (!book || restoredRef.current) return;
    if (!layoutH || !contentH) return;

    const denom = Math.max(1, contentH - layoutH);
    const savedOffset = typeof book.location?.offset === 'number' ? book.location.offset : undefined;
    const fromProgress = typeof book.progress === 'number' ? book.progress * denom : 0;

    let y = 0;
    if (typeof savedOffset === 'number' && isFinite(savedOffset)) {
      y = Math.max(0, Math.min(savedOffset, denom));
    } else {
      y = Math.max(0, Math.min(fromProgress, denom));
    }

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y, animated: false });
      restoredRef.current = true;
    });
  }, [book, layoutH, contentH]);

  React.useEffect(() => {
    tryRestore();
  }, [tryRestore, content]);

  const onLayout = (e: any) => setLayoutH(e.nativeEvent.layout.height);
  const onContentSizeChange = (_w: number, h: number) => setContentH(h);

  // save progress + pixel offset
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
        <Stack.Screen options={{ title: 'Reading', headerShown: true }} />
        <Box flex={1} alignItems="center" justifyContent="center">
          <Text>No book found.</Text>
        </Box>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: book.title }} />
      <Box flex={1} bg="background" onLayout={onLayout}>
        <ScrollView
          ref={scrollRef}
          onContentSizeChange={onContentSizeChange}
          style={{ flex: 1, padding: 16 }}
          onScroll={onScroll}
          scrollEventThrottle={200}
        >
          <Text color={theme.colors.text} fontSize={16} lineHeight={24}>
            {book?.content || 'No content available.'}
          </Text>
        </ScrollView>
      </Box>
    </>
  );
}
