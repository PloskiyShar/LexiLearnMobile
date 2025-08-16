// app/add-book.tsx
import React from 'react';
import { Stack, router } from 'expo-router';
import { View, Text, Button, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';
import { useBooks } from '../src/store/books';
import { parseEpubFromBase64 } from '../src/lib/epub';
import BackButton from "src/components/BackButton";
import {getColor} from "src/theme/getColor";
import {useIOSColors} from "src/theme/useIOSColor";

export default function AddBook() {
  const { upsertBook, setCurrent } = useBooks();
  const [loading, setLoading] = React.useState(false);
  const c = useIOSColors()

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
      <Stack.Screen options={{
        title: 'Add Book',
        headerLargeTitle: false,
        headerShadowVisible: false,
        headerTransparent: false,
        headerBackgroundColor: c.background,
        headerShown: true,
        headerLeft: () => <BackButton />,
      }} />
      <View style={styles.container}>
        <Text style={[styles.text, { color: c.label }]}>Choose a book file from your device.</Text>

        <TouchableOpacity
          onPress={pick}
          disabled={loading}
          style={[styles.button, loading && { opacity: 0.6 }, {backgroundColor: c.groupBg}]}
        >
          <Text style={[styles.buttonText, { color: c.tint }]}>{loading ? 'Importing…' : 'Choose File'}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    // backgroundColor: '#fff', // native white background
  },
  text: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#007AFF', // iOS link color
    fontSize: 17,
    fontWeight: '600',
  },
});