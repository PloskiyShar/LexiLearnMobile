// src/store/books.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export type ReaderKind = 'text' | 'epub'; // add 'pdf' later if you re-enable it

export type Book = {
  id: string;
  title: string;
  author?: string;
  kind: ReaderKind;
  /** Absolute file uri where the book's *plain text* is stored */
  fileUri: string;
  /** 0..1 */
  progress: number;
  /** Optional logical position (useful for EPUBs) */
  location?: {
    cfi?: string;       // EPUB CFI
    chapter?: number;   // your own notion of chapter
    offset?: number;    // character/word offset in text
  };
  wordCount?: number;
  lastOpenedAt?: number;
};

type ReviewItem = { id: string; text: string; context?: string; dueAt: number };

type BooksState = {
  books: Record<string, Book>;
  currentId?: string;
  reviews: ReviewItem[];

  // hydration flag (nice to gate the UI)
  _hasHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;

  // core CRUD
  setCurrent: (id: string | undefined) => void;
  upsertBook: (b: Book) => void;
  updateProgress: (id: string, p: number) => void;
  setLocation: (id: string, loc: Book['location']) => void;
  removeBook: (id: string) => Promise<void>;

  // create + IO
  createFromText: (args: {
    title: string;
    author?: string;
    text: string;
    kind?: ReaderKind; // defaults to 'text'
  }) => Promise<string>;
  loadText: (id: string) => Promise<string>;

  // reviews (unchanged)
  addReviews: (items: ReviewItem[]) => void;
  popDue: () => ReviewItem | undefined;
};

const BOOKS_DIR = `${FileSystem.documentDirectory}books`;

async function ensureBooksDir() {
  try {
    const info = await FileSystem.getInfoAsync(BOOKS_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(BOOKS_DIR, { intermediates: true });
    }
  } catch {
    // swallow – next write will error if it truly fails
  }
}

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
        set((s) => ({
          books: {
            ...s.books,
            [b.id]: { ...s.books[b.id], ...b }, // this keeps content as well
          },
        })),

      updateProgress: (id, p) =>
        set((s) => {
          const clamped = Math.min(1, Math.max(0, p));
          const prev = s.books[id];
          if (!prev) return s;
          return {
            books: {
              ...s.books,
              [id]: { ...prev, progress: clamped, lastOpenedAt: Date.now() },
            },
          };
        }),

      setLocation: (id, loc) =>
        set((s) => {
          const prev = s.books[id];
          if (!prev) return s;
          return { books: { ...s.books, [id]: { ...prev, location: { ...prev.location, ...loc } } } };
        }),

      removeBook: async (id) => {
        const { books } = get();
        const b = books[id];
        if (b?.fileUri) {
          try {
            const info = await FileSystem.getInfoAsync(b.fileUri);
            if (info.exists) await FileSystem.deleteAsync(b.fileUri, { idempotent: true });
          } catch {}
        }
        set((s) => {
          const next = { ...s.books };
          delete next[id];
          const currentId = s.currentId === id ? undefined : s.currentId;
          return { books: next, currentId };
        });
      },

      createFromText: async ({ title, author, text, kind = 'text' }) => {
        await ensureBooksDir();
        const id = String(Date.now());
        const fileUri = `${BOOKS_DIR}/${id}.txt`;
        await FileSystem.writeAsStringAsync(fileUri, text, { encoding: FileSystem.EncodingType.UTF8 });

        // light metadata – not storing the whole text in AsyncStorage
        const wordCount = text.trim().split(/\s+/).length;
        const book: Book = {
          id,
          title: title || 'Untitled',
          author,
          kind,
          fileUri,
          progress: 0,
          wordCount,
          lastOpenedAt: Date.now(),
        };

        set((s) => ({ books: { ...s.books, [id]: book }, currentId: id }));
        return id;
      },

      loadText: async (id) => {
        const b = get().books[id];
        if (!b) throw new Error('Book not found');
        return FileSystem.readAsStringAsync(b.fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      },

      // --- reviews: unchanged ---
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
      name: 'books-v2', // bump key because schema changed
      storage: createJSONStorage(() => AsyncStorage),
      // only persist metadata, not the big text
      partialize: (s) => ({
        books: s.books,
        currentId: s.currentId,
        reviews: s.reviews,
      }),
      onRehydrateStorage: () => (state) => {
        state?._setHasHydrated(true);
      },
      version: 2,
      // If you want to keep old v1 keys, you can migrate here
      // migrate: (persisted, from) => persisted,
    }
  )
);
