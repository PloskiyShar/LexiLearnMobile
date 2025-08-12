import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Book = { id: string; title: string; author?: string; content?: string; progress: number; };
type ReviewItem = { id: string; text: string; context?: string; dueAt: number; };

type BooksState = {
  books: Record<string, Book>;
  currentId?: string;
  reviews: ReviewItem[];
  setCurrent: (id: string) => void;
  upsertBook: (b: Book) => void;
  updateProgress: (id: string, p: number) => void;
  addReviews: (items: ReviewItem[]) => void;
  popDue: () => ReviewItem | undefined;
  // hydration flag (nice to gate the UI)
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;
};

export const useBooks = create<BooksState>()(
  persist(
    (set, get) => ({
      books: {},
      currentId: undefined,
      reviews: [],
      _hasHydrated: false,
      _setHasHydrated: (v) => set({ _hasHydrated: v }),

      setCurrent: (id) => set({ currentId: id }),
      upsertBook: (b) =>
        set((s) => ({ books: { ...s.books, [b.id]: { ...s.books[b.id], ...b } } })),
      updateProgress: (id, p) =>
        set((s) => ({
          books: { ...s.books, [id]: { ...s.books[id], progress: Math.min(1, Math.max(0, p)) } },
        })),
      addReviews: (items) => set((s) => ({ reviews: [...s.reviews, ...items] })),
      popDue: () => {
        const now = Date.now();
        const list = [...get().reviews];
        const i = list.findIndex((r) => r.dueAt <= now);
        if (i < 0) return;
        const [item] = list.splice(i, 1);
        set({ reviews: list });
        return item;
      },
    }),
    {
      name: "books-v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        books: s.books,
        currentId: s.currentId,
        reviews: s.reviews,
      }),
      onRehydrateStorage: () => (state) => {
        // runs after hydration
        state?._setHasHydrated(true);
      },
      version: 1,
      // migrate: (persisted, from) => persisted, // add later if you bump version
    }
  )
);
