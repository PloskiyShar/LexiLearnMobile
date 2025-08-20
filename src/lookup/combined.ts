import { LookupResult, UILang, TextLang } from './types';
import { fetchFreeDict } from '../net/freeDict';
import { fetchWiktionary } from '../net/wiktionary';
import { fetchExamplePairs } from '../net/tatoeba';

function dedupeStrings(arr: string[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const s of arr) {
    const k = s.trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(s.trim());
  }
  return out;
}

export async function lookupCombined(surface: string, textLang: TextLang, uiLang: UILang): Promise<LookupResult | null> {
  const word = surface.trim();

  // parallel fetch (race + merge)
  const [fd, wt, ex] = await Promise.all([
    fetchFreeDict(word, uiLang).catch(() => null),
    fetchWiktionary(word, uiLang).catch(() => null),
    fetchExamplePairs(word, textLang === 'en' ? 'eng' : 'rus', uiLang === 'en' ? 'eng' : 'rus', 6).catch(() => [])
  ]);

  if (!fd && !wt && (!ex || !ex.length)) return null;

  const senses = dedupeStrings([
    ...(fd?.senses ?? []),
    ...(wt?.senses ?? []),
  ]).slice(0, 24);

  const ipa = dedupeStrings([...(fd?.ipa ?? [])]).slice(0, 6);
  const audio = fd?.audio; // FreeDict usually provides an mp3 for EN

  const pos = dedupeStrings([...(fd?.pos ?? [])]);

  const examples = (ex ?? []).slice(0, 10);

  return {
    lemma: word,
    senses,
    ipa: ipa.length ? ipa : undefined,
    audio,
    examples,
    pos: pos.length ? pos : undefined,
    sourceMeta: { freeDict: !!fd, wiktionary: !!wt, tatoeba: !!(ex?.length) }
  };
}
