export type Bookmark = {
  verseKey: string; // "2:255"
  title?: string;
  createdAt: number;
};

const BOOKMARKS_KEY = "pbul:bookmarks:v1";
const PROGRESS_KEY = "pbul:progress:v1";

export function loadBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Bookmark[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveBookmarks(bookmarks: Bookmark[]) {
  window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

export function toggleBookmark(verseKey: string, title?: string) {
  const list = loadBookmarks();
  const idx = list.findIndex((b) => b.verseKey === verseKey);
  if (idx >= 0) {
    list.splice(idx, 1);
    saveBookmarks(list);
    return { bookmarked: false };
  }
  list.unshift({ verseKey, title, createdAt: Date.now() });
  saveBookmarks(list);
  return { bookmarked: true };
}

export function isBookmarked(verseKey: string) {
  return loadBookmarks().some((b) => b.verseKey === verseKey);
}

export function togglePageBookmark(pageNumber: number, title?: string) {
  return toggleBookmark(`page:${pageNumber}`, title ?? `Page ${pageNumber}`);
}

export function isPageBookmarked(pageNumber: number) {
  return isBookmarked(`page:${pageNumber}`);
}

export function loadProgress(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveProgress(scope: string, verseKey: string) {
  const p = loadProgress();
  p[scope] = verseKey;
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}
