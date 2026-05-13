"use client";

type TranslationResource = {
  id: number;
  name: string;
  slug?: string;
  language_name?: string;
};

type VerseTranslation = {
  resource_id: number;
  text: string;
  language_name?: string;
  resource_name?: string;
};

export type RemoteVerse = {
  verse_key: string;
  verse_number: number;
  chapter_id: number;
  text_uthmani: string;
  // Some endpoints include derived metadata (e.g. page number).
  page?: number;
  juz?: number;
  translations?: VerseTranslation[];
};

export type RemoteChapter = {
  id: number;
  name_simple: string;
  name_arabic: string;
  name_complex?: string;
  verses_count?: number;
};

type PagedVersesResponse = {
  code: number;
  status: string;
  data: { verses: RemoteVerse[] };
  pagination?: {
    current_page: number;
    next_page: number | null;
    total_pages: number;
    total_records: number;
    per_page: number;
  };
};

type TranslationsResponse = {
  code: number;
  status: string;
  data: { translations: TranslationResource[] };
};

const API_BASE = "https://api.islamic.app/v1";
const MALAY_TRANSLATION_CACHE_KEY = "pbul:malay-translation:v1";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export async function getMalayTranslationIdOrSlug(): Promise<string | undefined> {
  try {
    const cached = window.localStorage.getItem(MALAY_TRANSLATION_CACHE_KEY);
    if (cached) return cached;
  } catch {
    // ignore
  }

  const url = `${API_BASE}/resources/translations`;
  const json = await fetchJson<TranslationsResponse>(url);
  const list = json.data?.translations ?? [];

  const cand = list.find((t) => {
    const ln = (t.language_name ?? "").toLowerCase();
    const name = (t.name ?? "").toLowerCase();
    return (
      ln.includes("malay") ||
      ln.includes("bahasa") ||
      name.includes("bahasa melayu") ||
      name.includes("melayu")
    );
  });

  const value = cand?.slug ? cand.slug : cand?.id ? String(cand.id) : undefined;
  if (value) {
    try {
      window.localStorage.setItem(MALAY_TRANSLATION_CACHE_KEY, value);
    } catch {
      // ignore
    }
  }
  return value;
}

export async function fetchChapterVerses(
  chapter: number,
  opts?: { page?: number; perPage?: number; translation?: string }
) {
  const page = opts?.page ?? 1;
  const perPage = opts?.perPage ?? 50;
  const translation = opts?.translation;
  const qp: string[] = [
    `page=${encodeURIComponent(String(page))}`,
    `per_page=${encodeURIComponent(String(perPage))}`,
    `fields=${encodeURIComponent("text_uthmani")}`,
    `words=false`
  ];
  if (translation) qp.push(`translations=${encodeURIComponent(translation)}`);
  const url = `${API_BASE}/verses/by_chapter/${chapter}?${qp.join("&")}`;
  return fetchJson<PagedVersesResponse>(url);
}

export async function fetchJuzVerses(
  juzNumber: number,
  opts?: { page?: number; perPage?: number; translation?: string }
) {
  const page = opts?.page ?? 1;
  const perPage = opts?.perPage ?? 50;
  const translation = opts?.translation;
  const qp: string[] = [
    `page=${encodeURIComponent(String(page))}`,
    `per_page=${encodeURIComponent(String(perPage))}`,
    `fields=${encodeURIComponent("text_uthmani")}`,
    `words=false`
  ];
  if (translation) qp.push(`translations=${encodeURIComponent(translation)}`);
  const url = `${API_BASE}/verses/by_juz/${juzNumber}?${qp.join("&")}`;
  return fetchJson<PagedVersesResponse>(url);
}

export async function fetchPageVerses(
  pageNumber: number,
  opts?: { translation?: string }
) {
  const translation = opts?.translation;
  const qp: string[] = [
    `fields=${encodeURIComponent("text_uthmani")}`,
    `words=false`
  ];
  if (translation) qp.push(`translations=${encodeURIComponent(translation)}`);
  const url = `${API_BASE}/verses/by_page/${pageNumber}?${qp.join("&")}`;
  return fetchJson<PagedVersesResponse>(url);
}

export async function fetchChapters(language?: string) {
  const lang = language ?? "en";
  const url = `${API_BASE}/chapters?language=${encodeURIComponent(lang)}`;
  return fetchJson<{ code: number; status: string; data: { chapters: RemoteChapter[] } }>(url);
}
