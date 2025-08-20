import AsyncStorage from '@react-native-async-storage/async-storage';
import { LookupResult } from '../lookup/types';

type DictPhonetic = { text?: string; audio?: string };
type DictMeaning = { partOfSpeech?: string; definitions: { definition: string; example?: string; synonyms?: string[] }[] };
type DictEntry = { word: string; phonetics?: DictPhonetic[]; meanings?: DictMeaning[] };

const BASE = 'https://api.dictionaryapi.dev/api/v2/entries';

function dictLang(ui: 'en'|'ru') { return ui === 'en' ? 'en' : 'ru'; }
const MEM = new Map<string, LookupResult | null>();

export async function fetchFreeDict(word: string, ui: 'en'|'ru', ms = 6000): Promise<LookupResult | null> {
  const key = `freeDict:${ui}:${word.toLowerCase()}`;
  if (MEM.has(key)) return MEM.get(key)!;
  const cached = await AsyncStorage.getItem(key);
  if (cached) { const v = JSON.parse(cached); MEM.set(key, v); return v; }

  const url = `${BASE}/${dictLang(ui)}/${encodeURIComponent(word)}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);

  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) { MEM.set(key, null); return null; }
    const json = (await res.json()) as any;
    const arr: DictEntry[] = Array.isArray(json) ? json : [];
    if (!arr.length) { MEM.set(key, null); return null; }

    // Gather IPA/audio/defs
    const ipaSet = new Set<string>();
    let audio: string | undefined;
    const senses: string[] = [];
    const posSet = new Set<string>();

    for (const e of arr) {
      for (const p of (e.phonetics ?? [])) {
        if (p.text) ipaSet.add(p.text);
        if (!audio && p.audio) audio = p.audio;
      }
      for (const m of (e.meanings ?? [])) {
        if (m.partOfSpeech) posSet.add(m.partOfSpeech);
        for (const d of (m.definitions ?? [])) {
          if (d.definition) senses.push(d.definition);
        }
      }
    }

    const out: LookupResult = {
      lemma: word,
      senses,
      ipa: Array.from(ipaSet),
      audio,
      examples: [],   // we’ll fill from Tatoeba
      pos: Array.from(posSet),
      sourceMeta: { freeDict: true }
    };

    MEM.set(key, out);
    await AsyncStorage.setItem(key, JSON.stringify(out));
    return out;
  } catch {
    MEM.set(key, null);
    return null;
  } finally {
    clearTimeout(t);
  }
}
