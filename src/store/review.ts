// src/store/review.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ratings like Anki UI:
export type Rating = 'again' | 'hard' | 'good' | 'easy';

export type Card = {
  key: string;          // the lowercase lemma/word
  level: 0|1|2|3|4;     // your visible "knowledge" level
  ease: number;         // SM-2 ease factor (e.g. 2.5)
  interval: number;     // days (can be fractional <1)
  reps: number;         // successful reviews in a row
  lapses: number;       // times failed
  dueAt: number;        // ms since epoch
  suspended?: boolean;  // optional: pause if fully known
};

type ReviewState = {
  cards: Record<string, Card>;

  // queue helpers
  now: () => number;
  getDueKeys: () => string[];
  getNextDue: () => Card | undefined;

  // lifecycle
  ensureInQueue: (key: string) => void;
  setByLevel: (key: string, level: 0|1|2|3|4) => void;

  // review answer -> schedule next
  answer: (key: string, rating: Rating) => void;

  // utilities
  remove: (key: string) => void;
  clearAll: () => void;
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function initialByLevel(level: 0|1|2|3|4) {
  // Rough mapping of your visible level to initial schedule
  // (tweak as you wish)
  switch (level) {
    case 0: return { ease: 2.3, interval: 0, dueInMin: 0 };        // new
    case 1: return { ease: 2.3, interval: 0, dueInMin: 10 };       // short learning step
    case 2: return { ease: 2.4, interval: 1, dueInMin: 60 * 24 };  // ~1 day
    case 3: return { ease: 2.5, interval: 3, dueInMin: 60 * 24 * 3 };
    case 4: return { ease: 2.6, interval: 10, dueInMin: 60 * 24 * 10 };
  }
}

export const useReview = create<ReviewState>()(
  persist(
    (set, get) => ({
      cards: {},

      now: () => Date.now(),
      getDueKeys: () => {
        const n = get().now();
        return Object.values(get().cards)
          .filter(c => !c.suspended && c.dueAt <= n)
          .sort((a, b) => a.dueAt - b.dueAt)
          .map(c => c.key);
      },
      getNextDue: () => {
        const n = get().now();
        const list = Object.values(get().cards)
          .filter(c => !c.suspended && c.dueAt <= n)
          .sort((a, b) => a.dueAt - b.dueAt);
        return list[0];
      },

      ensureInQueue: (key) =>
        set(s => {
          const k = key.toLowerCase();
          if (s.cards[k]) return s;
          const t = Date.now();
          return {
            cards: {
              ...s.cards,
              [k]: { key: k, level: 0, ease: 2.3, interval: 0, reps: 0, lapses: 0, dueAt: t },
            },
          };
        }),

      setByLevel: (key, level) =>
        set(s => {
          const k = key.toLowerCase();
          const prev = s.cards[k] ?? {
            key: k, level: 0, ease: 2.3, interval: 0, reps: 0, lapses: 0, dueAt: Date.now(),
          };
          const init = initialByLevel(level);
          const dueAt = Date.now() + init.dueInMin * 60_000;
          const next: Card = {
            ...prev,
            level,
            ease: init.ease,
            interval: init.interval,
            dueAt,
            reps: Math.max(prev.reps, level > 0 ? 1 : 0),
          };
          return { cards: { ...s.cards, [k]: next } };
        }),

      answer: (key, rating) =>
        set(s => {
          const k = key.toLowerCase();
          const c = s.cards[k];
          if (!c) return s;

          let { ease, interval, reps, lapses, level } = c;
          const now = Date.now();

          // Map rating to SM-2 scale (0..4) → We use: again=1, hard=2, good=3, easy=4
          const q = rating === 'again' ? 1 : rating === 'hard' ? 2 : rating === 'good' ? 3 : 4;

          if (q <= 1) {
            // lapse
            lapses += 1;
            reps = 0;
            ease = clamp(ease - 0.2, 1.3, 3.0);
            interval = 0; // re-learning step
            // due soon (10 minutes)
            const dueAt = now + 10 * 60_000;
            // lower visible level but not below 1 if it was >1
            level = (level > 1 ? (level - 1) as 0|1|2|3|4 : 0);
            return { cards: { ...s.cards, [k]: { ...c, ease, interval, reps, lapses, dueAt, level } } };
          } else {
            // success → update ease
            const easeDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
            ease = clamp(ease + easeDelta, 1.3, 3.0);
            // intervals (in days)
            if (reps === 0) interval = 1;
            else if (reps === 1) interval = 6;
            else interval = Math.round(interval * ease);
            reps += 1;
            const dueAt = now + interval * 24 * 60 * 60_000;
            // raise visible level gradually up to 4
            level = clamp(level + (rating === 'easy' ? 2 : 1), 0, 4) as 0|1|2|3|4;
            return { cards: { ...s.cards, [k]: { ...c, ease, interval, reps, lapses, dueAt, level } } };
          }
        }),

      remove: (key) =>
        set(s => {
          const copy = { ...s.cards };
          delete copy[key.toLowerCase()];
          return { cards: copy };
        }),

      clearAll: () => set({ cards: {} }),
    }),
    {
      name: 'review-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: s => ({ cards: s.cards }),
      version: 1,
    }
  )
);
