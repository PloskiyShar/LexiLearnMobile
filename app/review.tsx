// app/review.tsx
import * as React from 'react';
import { Stack } from 'expo-router';
import { View, Text, ActivityIndicator, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { useReview } from '@/src/store/review';
import { lookupCombined } from '@/src/lookup/combined';
import {useIOSColors} from "src/theme/useIOSColor";

export default function ReviewScreen() {
  const c = useIOSColors()
  const srs = useReview();
  const dueKeys = srs.getDueKeys();
  const currentKey = dueKeys[0];

  const [loading, setLoading] = React.useState(false);
  const [entry, setEntry] = React.useState<any>(null);
  const [showAnswer, setShowAnswer] = React.useState(false);

  React.useEffect(() => {
    let on = true;
    (async () => {
      if (!currentKey) { setEntry(null); return; }
      setLoading(true);
      const data = await lookupCombined(currentKey, 'en', 'en'); // ← use your textLang/uiLang here
      if (on) setEntry(data);
      setLoading(false);
      setShowAnswer(false);
    })();
    return () => { on = false; };
  }, [currentKey]);

  const onRate = (r: 'again'|'hard'|'good'|'easy') => {
    if (!currentKey) return;
    srs.answer(currentKey, r);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Review' }} />
      <View style={[styles.container, { backgroundColor: c.background }]}>
        {!currentKey ? (
          <View style={styles.center}>
            <Text style={[styles.title, { color: c.label }]}>All done 🎉</Text>
            <Text style={{ color: c.label }}>No cards due.</Text>
          </View>
        ) : loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={{ color: c.label }}>Loading…</Text>
          </View>
        ) : (
          <View style={{ gap: 16, flex: 1 }}>
            {/* Prompt side */}
            <View style={{ padding: 16 }}>
              <Text style={[styles.word, { color: c.label }]}>{currentKey}</Text>
              {!!entry?.ipa?.length && (
                <Text style={{ color: c.tint, marginTop: 4 }}>{entry.ipa[0]}</Text>
              )}
            </View>

            {/* Reveal / Answer */}
            {!showAnswer ? (
              <Pressable
                style={[styles.revealBtn, { borderColor: c.separator, backgroundColor: c.background }]}
                onPress={() => setShowAnswer(true)}
              >
                <Text style={{ color: c.label }}>Show answer</Text>
              </Pressable>
            ) : (
              <View style={{ paddingHorizontal: 16, gap: 10 }}>
                {!!entry?.senses?.length && (
                  <View style={{ gap: 6 }}>
                    {entry.senses.slice(0, 5).map((s: string, i: number) => (
                      <View key={i} style={{ flexDirection: 'row' }}>
                        <Text style={{ color: c.tint, marginRight: 8 }}>•</Text>
                        <Text style={{ color: c.label, flex: 1 }}>{s}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {!!entry?.examples?.length && (
                  <View style={{ gap: 6, marginTop: 8 }}>
                    {entry.examples.slice(0, 3).map((e: any, i: number) => (
                      <View key={i} style={{ gap: 2 }}>
                        <Text style={{ color: c.label}}>{e.text}</Text>
                        {!!e.trans && <Text style={{ color: c.label }}>{e.trans}</Text>}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Answer buttons */}
            {showAnswer && (
              <View style={styles.row}>
                <Btn label="Again" onPress={() => onRate('again')} />
                <Btn label="Hard"  onPress={() => onRate('hard')}  />
                <Btn label="Good"  onPress={() => onRate('good')}  />
                <Btn label="Easy"  onPress={() => onRate('easy')}  />
              </View>
            )}
          </View>
        )}
      </View>
    </>
  );
}

function Btn({ label, onPress, dark }: { label: string; onPress: () => void; dark: boolean }) {
  const c = useIOSColors()

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.btn,
        { borderColor: c.separator, backgroundColor: c.background },
      ]}
    >
      <Text style={{ color: c.label, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 20, fontWeight: '700' },
  word: { fontSize: 28, fontWeight: '800' },
  revealBtn: { marginHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 8, marginTop: 'auto', paddingBottom: 12 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
});
