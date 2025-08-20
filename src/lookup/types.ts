export type ExamplePair = { text: string; trans?: string };

export type LookupResult = {
  lemma: string;
  senses: string[];
  ipa?: string[];
  audio?: string;
  examples: ExamplePair[];
  pos?: string[];
  sourceMeta?: { freeDict?: boolean; wiktionary?: boolean; tatoeba?: boolean };
};

export type UILang = 'en' | 'ru';     // UI language (definition language preference)
export type TextLang = 'en' | 'ru';   // language of the text being read
