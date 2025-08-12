import * as FileSystem from 'expo-file-system';

const BOOKS_DIR = FileSystem.documentDirectory! + 'books/';

export async function ensureBooksDir() {
  try {
    await FileSystem.makeDirectoryAsync(BOOKS_DIR, { intermediates: true });
  } catch {}
}

export async function saveBookText(id: string, text: string) {
  await ensureBooksDir();
  const path = `${BOOKS_DIR}${id}.txt`;
  await FileSystem.writeAsStringAsync(path, text, { encoding: 'utf8' });
  return path;
}

export async function loadBookText(path: string) {
  return FileSystem.readAsStringAsync(path, { encoding: 'utf8' });
}

export async function deleteBookFile(path?: string) {
  if (!path) return;
  try {
    await FileSystem.deleteAsync(path, { idempotent: true });
  } catch {}
}
