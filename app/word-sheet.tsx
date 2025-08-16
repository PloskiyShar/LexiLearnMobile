// app/word-sheet.tsx
import * as React from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import {useIOSColors} from "src/theme/useIOSColor";

export default function WordSheet() {
  const { word = '' } = useLocalSearchParams<{ word?: string }>();
  const c = useIOSColors()

  return (
    <>
      <Stack.Screen
        options={{
          // title: String(word || 'Word'),
          // 👇 all the native sheet bits
          presentation: 'formSheet',          // iOS sheet
          animation: 'slide_from_bottom',
          gestureDirection: 'vertical',
          sheetGrabberVisible: true,
          sheetInitialDetentIndex: 0,         // start at first detent
          sheetAllowedDetents: [0.5, 0.75, 1],
          sheetCornerRadius: 20,
          sheetExpandsWhenScrolledToEdge: true,
          sheetElevation: 24,
          headerLargeTitle: false,
        }}
      />
      <ScrollView
        // contentContainerStyle={styles.container}
      >
        <View style={[styles.card, {backgroundColor: c.background}]}>
          <Text style={[styles.title, {color: c.label}]}>{String(word)}</Text>
          <Text style={styles.sub}>Tap an action:</Text>

          <View style={styles.row}>
            <Pressable style={styles.cta}>
              <Text style={styles.ctaText}>Add to Review</Text>
            </Pressable>
            <Pressable style={styles.cta}>
              <Text style={styles.ctaText}>Copy</Text>
            </Pressable>
          </View>

          {/* …your definitions/usage/translation/etc */}
          <Text style={[styles.body, {color: c.label}]}>
            Put definitions, examples and actions here. Scrolling to top will expand to full height because
            `sheetExpandsWhenScrolledToEdge` is enabled.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: { fontSize: 22, fontWeight: '600' },
  sub: { marginTop: 8, color: '#6b7280' },
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  cta: { backgroundColor: '#111827', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  ctaText: { color: 'white', fontWeight: '600' },
  body: { marginTop: 16, lineHeight: 22, color: '#111827' },
});
