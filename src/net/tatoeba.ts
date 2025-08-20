import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExamplePair } from '../lookup/types';

type Lang = 'eng'|'rus';
const MEM = new Map<string, ExamplePair[]>();

export async function fetchExamplePairs(word: string, from: Lang, to: Lang, limit = 5, ms = 6000): Promise<ExamplePair[]> {
  const key = `tato:${from}->${to}:${word.toLowerCase()}`;
  if (MEM.has(key)) return MEM.get(key)!;
  const cached = await AsyncStorage.getItem(key);
  if (cached) { const v = JSON.parse(cached); MEM.set(key, v); return v; }

  const q = encodeURIComponent(word);
  const url = `https://tatoeba.org/eng/api_v0/search?query=${q}&from=${from}&to=${to}&orphans=no&unapproved=no&sort=random&sort_reverse=no&limit=${limit}`;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);

  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) { MEM.set(key, []); return []; }
    const data = await res.json();
    const results: any[] = Array.isArray(data?.results) ? data.results : [];
    const pairs: ExamplePair[] = results.map(r => {
      const trans = (r.translations || []).find((tr: any) => tr.lang === to)?.text;
      return { text: r.text, trans };
    });
    MEM.set(key, pairs);
    await AsyncStorage.setItem(key, JSON.stringify(pairs));
    return pairs;
  } catch {
    MEM.set(key, []);
    return [];
  } finally {
    clearTimeout(t);
  }
}
