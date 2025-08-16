import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Appearance, ColorSchemeName } from 'react-native'

export type ThemePreference = 'system' | 'light' | 'dark'
type Mode = 'light' | 'dark'

const computeEffective = (pref: ThemePreference, sys: ColorSchemeName): Mode =>
  pref === 'system' ? (sys === 'dark' ? 'dark' : 'light') : pref

type State = {
  preference: ThemePreference
  effective: Mode
  setPreference: (p: ThemePreference) => void
  toggleNight: () => void
}

export const useThemePref = create<State>()(
  persist(
    (set, get) => {
      const sys = Appearance.getColorScheme()
      return {
        preference: 'system',
        effective: computeEffective('system', sys),

        setPreference: (p) => {
          const next = computeEffective(p, Appearance.getColorScheme())
          set({ preference: p, effective: next })
        },

        // Toggles between explicit Light/Dark (doesn't leave it on "system")
        toggleNight: () => {
          const current = get().effective
          const nextPref: ThemePreference = current === 'dark' ? 'light' : 'dark'
          set({ preference: nextPref, effective: nextPref })
        },
      }
    },
    {
      name: 'theme-pref-v1',
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (s) => ({ preference: s.preference }),

      onRehydrateStorage: () => (state) => {
        // After hydration, sync effective and subscribe to system changes
        const sync = () => {
          const pref = state?.getState().preference ?? 'system'
          const next = computeEffective(pref, Appearance.getColorScheme())
          state?.setState?.({ effective: next })
        }

        sync()
        const sub = Appearance.addChangeListener(() => {
          const pref = state?.getState().preference
          if (pref === 'system') sync()
        })
        return () => sub.remove()
      },
    }
  )
)
