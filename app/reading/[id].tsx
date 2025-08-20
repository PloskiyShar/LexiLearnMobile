// app/reading/[id].tsx
import * as React from 'react';
import { router } from 'expo-router';
import {
  StyleSheet,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useBooks } from '../../src/store/books';
import EpubWebView from '../../src/reader/EpubWebView';
import {useIOSColors} from "src/theme/useIOSColor";

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { books, setCurrent, updateProgress, setLocation, addReviews } = useBooks() as any;
  const c = useIOSColors()
  const ui: 'en'|'ru' = 'en' /* from your settings store */;
  const textLang: 'en'|'ru' = 'en' /* language of current book */;


  const book = id ? books?.[id] : undefined;
  const restoreY = book?.location?.offset ?? 0;


  React.useEffect(() => { if (id) setCurrent(id); }, [id, setCurrent]);

  const handleProgress = React.useCallback(
    ({ y, p }: { y: number; p: number }) => {
      if (!book) return;
      updateProgress?.(book.id, Math.max(0, Math.min(1, p)));
      setLocation?.(book.id, { offset: Math.max(0, y) });
    },
    [book, updateProgress, setLocation]
  );

  const onWord = (w: string) => {
    router.push({ pathname: `/(modals)/word-sheet/[${w}]`, params: { word: w,  } });
  };

  if (!book) {
    return (
      <>
        <Stack.Screen options={{ title: 'Reading' }} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: book.title }} />
      <EpubWebView
        content={book.content || ''}
        restoreY={restoreY}
        onWord={onWord}
        onProgress={handleProgress}
        bg={c.background}
        fg={c.label}
        fontSize={16}
        lineHeight={24}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 , fontSize: 50 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  readerContent: { paddingHorizontal: 18, paddingVertical: 16 },
});
