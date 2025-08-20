// app/[id].tsx
import * as React from 'react';
import {router, Stack, useLocalSearchParams} from 'expo-router';
import {View, Text, StyleSheet, ScrollView, Pressable, Button, ActivityIndicator} from 'react-native';
import {useIOSColors} from "src/theme/useIOSColor";
import {useEffect} from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useVocab, type Level } from 'src/store/vocab'
import {lookupCombined} from "src/lookup/combined";
import {LookupResult, TextLang, UILang} from "src/lookup/types";
import {useBooks} from "src/store/books";
import {Audio} from "expo-av";
import { useReview } from '@/src/store/review';

const LEVELS: { value: Level; label: string }[] = [
  { value: 0, label: 'New' },
  { value: 1, label: 'Unfamiliar' },
  { value: 2, label: 'Familiar' },
  { value: 3, label: 'Known' },
  { value: 4, label: 'Well-known' },
]


export default function Id() {
  const { word = '' } = useLocalSearchParams<{ word?: string }>();
  const review = useReview();

  const { ui = 'en' as UILang } = { ui: 'en' as UILang };
  const { currentId, books } = useBooks?.() ?? { currentId: undefined, books: {} as any };
  const textLang: TextLang =
    (currentId && books?.[currentId]?.lang) ? books[currentId].lang : 'en';
  const c = useIOSColors()
  const [data, setData] = React.useState<LookupResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const insets = useSafeAreaInsets()
  const vocab = useVocab()
  const saved = useVocab(s => s.get(word || ''))

  // audio
  const [sound, setSound] = React.useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = React.useState(false);

  // UI helpers
  const setLevel = (lvl: 0|1|2|3|4) => {
    const lemma = (data?.lemma ?? word).toLowerCase();
    // your existing vocab-level set:
    vocab.setLevel(lemma, lvl);
    // SRS: ensure card exists + schedule by level
    review.ensureInQueue(lemma);
    review.setByLevel(lemma, lvl);
  };
  const current: Level = (saved?.level ?? 0) as Level

  // bump exposure when opened
  React.useEffect(() => {
    if (word) vocab.bumpSeen(word)
  }, [word])

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setData(null);

        const surface = (word ?? '').trim();
        if (!surface) {
          setError('No word provided.');
          return;
        }

        const res = await lookupCombined(surface, textLang, ui);
        if (cancelled) return;
        if (!res) {
          setError(ui === 'ru' ? 'Ничего не найдено' : 'No results found');
          return;
        }
        setData(res);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Lookup failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [word, ui, textLang]);

 useEffect(() => {
    return () => {
      // unload audio on unmount
      (async () => {
        try { await sound?.unloadAsync(); } catch {}
      })();
    };
  }, [sound]);

  const onPlay = React.useCallback(async () => {
    if (!data?.audio) return;
    try {
      // if already loaded, toggle play/pause
      if (sound) {
        const status = await sound.getStatusAsync();
        if ('isLoaded' in status && status.isLoaded) {
          if (playing) {
            await sound.pauseAsync();
            setPlaying(false);
          } else {
            await sound.playAsync();
            setPlaying(true);
          }
          return;
        }
      }
      // create & play
      const { sound: snd } = await Audio.Sound.createAsync({ uri: data.audio });
      setSound(snd);
      snd.setOnPlaybackStatusUpdate((st) => {
        if (!st.isLoaded) return;
        if (st.didJustFinish) setPlaying(false);
        else setPlaying(!!st.isPlaying);
      });
      await snd.playAsync();
      setPlaying(true);
    } catch (e) {
      console.warn('audio failed', e);
    }
  }, [data?.audio, sound, playing]);

  console.log('wordData', data)
  return (
    <>
      <Stack.Screen
      />
      <ScrollView
      >
        <View style={[styles.card,{backgroundColor: c.background, paddingBottom: insets.bottom}]}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator />
              <Text style={[styles.muted, { color: c.label }]}>
                {ui === 'ru' ? 'Поиск…' : 'Looking up…'}
              </Text>
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Text style={[styles.title, { color: c.label }]}>{word}</Text>
              <Text style={[styles.muted, { color: c.destructive }]}>{error}</Text>
            </View>
          ) : data ? (
            <View style={{ gap: 16 }}>
              {/* Header row: lemma + IPA + audio */}
              <View style={styles.headerRow}>
                <Text style={[styles.title, { color: c.label }]} numberOfLines={1}>
                  {data.lemma}
                </Text>

                {!!data.ipa?.length && (
                  <View style={styles.ipaWrap}>
                    {data.ipa.slice(0, 2).map((p, i) => (
                      <Text key={i} style={[styles.ipa, { color: c.tint }]}>
                        {p}
                      </Text>
                    ))}
                  </View>
                )}

                {!!data.audio && (
                  <Pressable onPress={onPlay} style={({ pressed }) => [
                    styles.audioBtn,
                    { backgroundColor: pressed ? (c.background) : (c.secondaryBackground),
                      borderColor: c.separator }
                  ]}>
                    <Text style={{ color: c.label }}>
                      {playing ? (ui === 'ru' ? 'Пауза' : 'Pause') : (ui === 'ru' ? 'Проиграть' : 'Play')}
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* (optional) part-of-speech tags */}
              {!!data.pos?.length && (
                <View style={styles.posRow}>
                  {data.pos.slice(0, 3).map((p, idx) => (
                    <View key={idx} style={[styles.tag, { borderColor: c.separator, backgroundColor: c.background }]}>
                      <Text style={{ color: c.label }}>{p}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* knowledge level selector */}
              <View
                style={{flexDirection: 'row', gap: 8, alignItems: 'center'}}
              >
                {LEVELS.map(l => {
                  const active = current === l.value
                  return (
                    <Pressable
                      key={l.value}
                      onPress={() => setLevel(l.value)}
                    >
                      <Text style={{color: active ? c.tint : c.label}}>
                        {l.label}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>

              {/* Definitions */}
              {!!data.senses.length && (
                <View style={{ gap: 8 }}>
                  <Text style={[styles.sectionTitle, { color: c.label }]}>
                    {ui === 'ru' ? 'Значения' : 'Definitions'}
                  </Text>
                  <View style={{ gap: 6 }}>
                    {data.senses.slice(0, 8).map((s, i) => (
                      <View key={i} style={styles.bulletRow}>
                        <Text style={[styles.bullet, { color: c.tint }]}>•</Text>
                        <Text style={[styles.body, { color: c.label }]}>{s}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Examples */}
              {!!data.examples.length && (
                <View style={{ gap: 8 }}>
                  <Text style={[styles.sectionTitle, { color: c.label }]}>
                    {ui === 'ru' ? 'Примеры' : 'Examples'}
                  </Text>
                  <View style={{ gap: 10 }}>
                    {data.examples.slice(0, 8).map((ex, i) => (
                      <View key={i} style={[styles.bulletRow, { gap: 4 }]}>
                        {ex.text ? (<>
                            <Text style={[styles.bullet, { color: c.tint }]}>•</Text>
                          <Text style={[styles.body, { color: c.label }]}>{ex.text}</Text>
                        </>) : null}
                        {ex.trans ? (<>
                          <Text style={[styles.bullet, { color: c.background }]}>•</Text>
                          <Text style={[styles.body, { color: c.separator }]}>{ex.trans}</Text>
                        </>) : null}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Source badges */}
              <View >
                {data.sourceMeta?.freeDict && <Badge label="FreeDictionaryAPI" />}
                {data.sourceMeta?.wiktionary && <Badge label="Wiktionary" />}
                {data.sourceMeta?.tatoeba && <Badge label="Tatoeba" />}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

function Badge({ label }: { label: string; }) {
  const c = useIOSColors()

  return (
    <View style={[
      styles.tag,
      { borderColor: c.separator, backgroundColor: c.background }
    ]}>
      <Text style={{ color: c.label, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  content: { padding: 16, gap: 16 },
  center: { alignItems: 'center', gap: 10, paddingVertical: 24 },
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
  title: { fontSize: 22, fontWeight: '700' },
  sectionTitle: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22 },
  muted: { fontSize: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  ipaWrap: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  ipa: { fontSize: 16 },
  audioBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  posRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bullet: { width: 14, textAlign: 'center', marginTop: 2 },
});
