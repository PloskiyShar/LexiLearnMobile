// app/add-book.tsx
import React from 'react';
import { Stack, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import {Box, Text, useTheme} from '../src/theme/theme';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';
import { useBooks } from '../src/store/books';
import { parseEpubFromBase64 } from '../src/lib/epub';
import BackButton from "src/components/BackButton";

export default function AddBook() {
  const { upsertBook, setCurrent } = useBooks();
  const [loading, setLoading] = React.useState(false);
  const theme = useTheme();

  const pick = async () => {
    try {
      setLoading(true);

      const res = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'application/epub+zip', '*/*'],
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.[0]) return;

      const asset = res.assets[0];
      const id = String(Date.now());
      let text = '';

      // Parse file
      if (asset.mimeType === 'text/plain' || asset.name?.toLowerCase().endsWith('.txt')) {
        text = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'utf8' });
      } else if (asset.mimeType === 'application/epub+zip' || asset.name?.toLowerCase().endsWith('.epub')) {
        const b64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
        text = await parseEpubFromBase64(b64);
      } else {
        throw new Error('Unsupported file type (use .txt or .epub)');
      }
      const store = useBooks.getState();
      const alreadyExists = Object.values(store.books).some(
        (b) => b.title.trim().toLowerCase() === (asset.name ?? '').trim().toLowerCase()
      );

      if (alreadyExists) {
        Toast.show({
          type: 'error',
          text1: 'Duplicate book',
          text2: 'This book is already in your library.',
        });
        return;
      }
      // ✅ Always store actual content so reader sees it
      upsertBook({
        id,
        title: asset.name ?? 'Imported Book',
        content: text,
        progress: 0,
      });

      setCurrent(id);
      Toast.show({ type: 'success', text1: 'Imported', text2: asset.name ?? 'Book ready' });
      router.replace(`/reading/${id}`);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Import failed', text2: e?.message ?? 'Could not parse file' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Add book",
        headerBackground: () => (
          <Box flex={1} bg="background" />
        ) ,
        headerTintColor: theme.colors.foreground,
        headerShown: true,
        headerLeft: () => <BackButton />, }} />
      <Box flex={1} bg="background" padding="md" gap="md">
        <Text>Pick a text or EPUB file.</Text>
        <TouchableOpacity onPress={pick} disabled={loading} style={{ paddingVertical: 12 }}>
          <Box bg="primary" borderRadius="md" padding="md" alignItems="center" opacity={loading ? 0.6 : 1}>
            <Text color="background">{loading ? 'Importing…' : 'Choose file'}</Text>
          </Box>
        </TouchableOpacity>
      </Box>
    </>
  );
}
