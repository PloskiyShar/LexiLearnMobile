import AsyncStorage from '@react-native-async-storage/async-storage';
import { LookupResult } from '../lookup/types';

type LangCode = 'en'|'ru';
const MEM = new Map<string, LookupResult | null>();

function apiEndpoint(lang: LangCode) {
  return lang === 'en'
    ? 'https://en.wiktionary.org/w/api.php'
    : 'https://ru.wiktionary.org/w/api.php';
}

function stripMarkup(s: string) {
  return s
    // remove templates {{...}}
    .replace(/\{\{[^{}]*\}\}/g, '')
    // remove links [[text|show]] -> show, [[text]] -> text
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    // italics/bold
    .replace(/'''+([^']+)'''/g, '$1')
    .replace(/''([^']+)''/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// very simple section finders
function findLangSection(wikitext: string, lang: LangCode) {
  // ==English== or ==Русский==
  const marker = lang === 'en' ? '==English==' : '==Русский==';
  const i = wikitext.indexOf(marker);
  if (i < 0) return '';
  const rest = wikitext.slice(i + marker.length);
  const j = rest.indexOf('==');
  return j < 0 ? rest : rest.slice(0, j);
}

function extractDefs(section: string) {
  // capture lines that start with one or more '#'
  const lines = section.split('\n');
  const defs: string[] = [];
  for (const ln of lines) {
    const m = ln.match(/^\#+\s*(.*)$/);
    if (m) {
      const cleaned = stripMarkup(m[1]);
      if (cleaned && !/^\(?\s*alternative form of/i.test(cleaned)) {
        defs.push(cleaned);
      }
    }
  }
  // de-dup and trim length
  return Array.from(new Set(defs)).slice(0, 20);
}

export async function fetchWiktionary(word: string, ui: LangCode, ms = 6000): Promise<LookupResult | null> {
  const key = `wiktionary:${ui}:${word.toLowerCase()}`;
  if (MEM.has(key)) return MEM.get(key)!;
  const cached = await AsyncStorage.getItem(key);
  if (cached) { const v = JSON.parse(cached); MEM.set(key, v); return v; }

  const url = `${apiEndpoint(ui)}?origin=*&format=json&action=parse&prop=wikitext&page=${encodeURIComponent(word)}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);

  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) { MEM.set(key, null); return null; }
    const data = await res.json();
    const wikitext: string | undefined = data?.parse?.wikitext?.['*'];
    if (!wikitext) { MEM.set(key, null); return null; }

    const langSec = findLangSection(wikitext, ui);
    if (!langSec) { MEM.set(key, null); return null; }

    const senses = extractDefs(langSec);
    if (!senses.length) { MEM.set(key, null); return null; }

    const out: LookupResult = {
      lemma: word,
      senses,
      examples: [],
      sourceMeta: { wiktionary: true }
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
