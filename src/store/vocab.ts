import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type Level = 0 | 1 | 2 | 3 | 4 // 0=New, 1..4=learning→known

export type VocabItem = {
  key: string            // canonical lemma (lowercase)
  level: Level
  exposures: number
  lastSeen: number
}

type VocabState = {
  items: Record<string, VocabItem>
  setLevel: (key: string, level: Level) => void
  bumpSeen: (key: string) => void
  get: (key: string) => VocabItem | undefined
}

export const useVocab = create<VocabState>()(
  persist(
    (set, get) => ({
      items: {},
      setLevel: (key, level) =>
        set(s => ({
          items: {
            ...s.items,
            [key.toLowerCase()]: {
              ...(s.items[key.toLowerCase()] ?? {
                key: key.toLowerCase(),
                exposures: 0,
                lastSeen: Date.now(),
              }),
              level,
            },
          },
        })),
      bumpSeen: key =>
        set(s => {
          const k = key.toLowerCase()
          const prev = s.items[k]
          return {
            items: {
              ...s.items,
              [k]: {
                key: k,
                level: prev?.level ?? 0,
                exposures: (prev?.exposures ?? 0) + 1,
                lastSeen: Date.now(),
              },
            },
          }
        }),
      get: key => get().items[key.toLowerCase()],
    }),
    {
      name: 'vocab-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: s => ({ items: s.items }),
      version: 1,
    }
  )
)
