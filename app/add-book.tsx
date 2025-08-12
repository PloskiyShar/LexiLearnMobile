// app/add-book.tsx
import React from 'react';
import { Stack, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Box, Text } from '../src/theme/theme';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';
import { useBooks } from '../src/store/books';
import { parseEpubFromBase64 } from '../src/lib/epub';
// ❌ remove: import { parsePdfFromBase64 } from '../src/lib/pdf';
import FullScreenLoader from '../src/components/FullScreenLoader';

export default function AddBook() {
  const { upsertBook, setCurrent } = useBooks();
  const [loading, setLoading] = React.useState(false);

  const pick = async () => {
    try {
      setLoading(true);
      const res = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'application/epub+zip', '*/*'],
        copyToCacheDirectory: true,
      });
      if (res.canceled || !res.assets?.[0]) return;

      const asset = res.assets[0];
      const name = asset.name?.toLowerCase() ?? '';
      const mime = asset.mimeType?.toLowerCase() ?? '';
      const id = String(Date.now());
      let content = '';

      if (mime === 'text/plain' || name.endsWith('.txt')) {
        content = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'utf8' });
      } else if (mime === 'application/epub+zip' || name.endsWith('.epub')) {
        const b64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
        content = await parseEpubFromBase64(b64);
      } else if (name.endsWith('.pdf') || mime === 'application/pdf') {
        Toast.show({ type: 'error', text1: 'PDF not supported (yet)' });
        return;
      } else {
        Toast.show({ type: 'error', text1: 'Unsupported file', text2: 'Use .txt or .epub' });
        return;
      }

      upsertBook({ id, title: asset.name ?? 'Imported Book', content, progress: 0 });
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
      <Stack.Screen options={{ title: 'Add Book' }} />
      <Box flex={1} bg="background" padding="md" gap="md">
        <Text>Pick a .txt or .epub file.</Text>
        <TouchableOpacity onPress={pick} disabled={loading} style={{ paddingVertical: 12 }}>
          <Box bg="primary" borderRadius="md" padding="md" alignItems="center" opacity={loading ? 0.6 : 1}>
            <Text color="background">{loading ? 'Importing…' : 'Choose file'}</Text>
          </Box>
        </TouchableOpacity>
      </Box>
      <FullScreenLoader visible={loading} />
    </>
  );
}
