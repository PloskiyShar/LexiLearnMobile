// src/lookup/online.ts
import { fetchDictionary, flattenSenses, pickIPA, pickAudio } from '../net/freeDict';
import { fetchExamplePairs } from '../net/tatoeba';

// uiLang: 'en' or 'ru'; textLang: 'en' or 'ru'
export type UILang = 'en'|'ru';
export type TextLang = 'en'|'ru';

export type UILookup = {
  lemma: string;
  senses: string[];    // in the UI language when possible
  ipa?: string[];
  audio?: string;      // URL if any
  examples: { text: string; trans?: string }[];
};

function uiToDictLang(ui: UILang): 'en_US'|'ru' { return ui === 'en' ? 'en_US' : 'ru'; }
function uiToTatoeba(ui: UILang): 'eng'|'rus' { return ui === 'en' ? 'eng' : 'rus'; }

export async function lookupOnline(surface: string, textLang: TextLang, uiLang: UILang): Promise<UILookup | null> {
  const word = surface.trim();

  // 1) Try monolingual dictionary in the UI language for the *same surface*.
  //    (For EN words + RU UI, this may fail if the surface isn't a Russian word.)
  const dict = await fetchDictionary(word, uiToDictLang(uiLang));
  let senses = dict ? flattenSenses(dict) : [];
  let ipa = dict ? pickIPA(dict) : [];
  let audio = dict ? pickAudio(dict) : undefined;

  // 2) Examples with translations (always helpful cross-language)
  //    from = text language, to = ui language
  const pairs = await fetchExamplePairs(word,
    textLang === 'en' ? 'eng' : 'rus',
    uiLang  === 'en' ? 'eng' : 'rus',
    5
  );

  const examples = pairs.map(p => {
    const trans = p.translations?.find(t => t.lang === (uiLang === 'en' ? 'eng' : 'rus'))?.text;
    return { text: p.text, trans };
  });

  // 3) If dictionary failed (e.g., EN surface while ui=RU), fall back to EN dict so we still show definitions.
  if (!senses.length) {
    const enDict = await fetchDictionary(word, 'en_US');
    if (enDict) {
      senses = flattenSenses(enDict);
      ipa = pickIPA(enDict);
      audio = audio || pickAudio(enDict);
    }
  }

  if (!senses.length && !examples.length) return null;

  return { lemma: word, senses, ipa, audio, examples };
}
