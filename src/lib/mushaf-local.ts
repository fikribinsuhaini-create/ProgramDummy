import mushafPages from "@/data/mushaf-pages.json";

export type VerseRef = {
  verse_key: string;
  chapter_id: number;
  juz?: number;
  page?: number;
};

export type MushafPage = {
  page: number;
  juz?: number;
  verses: VerseRef[];
};

export function getMushafPages(): MushafPage[] {
  const pages = (mushafPages as unknown as { pages?: MushafPage[] }).pages ?? [];
  // Backward compat: older generated file stored juz at page level only.
  return pages.map((p) => ({
    ...p,
    verses: (p.verses ?? []).map((v) => ({
      ...v,
      juz: v.juz ?? p.juz,
      page: v.page ?? p.page
    }))
  }));
}

export function getMushafPage(pageNumber: number): MushafPage | undefined {
  return getMushafPages().find((p) => p.page === pageNumber);
}

export function getFirstPageForSurah(surahNumber: number): number | undefined {
  for (const p of getMushafPages()) {
    if (p.verses.some((v) => v.chapter_id === surahNumber)) return p.page;
  }
  return undefined;
}

export function getFirstPageForJuz(juzNumber: number): number | undefined {
  for (const p of getMushafPages()) {
    if (p.verses.some((v) => v.juz === juzNumber)) return p.page;
  }
  return undefined;
}

export function getVerseKeysForJuz(juzNumber: number): string[] {
  const keys: string[] = [];
  const seen = new Set<string>();
  for (const p of getMushafPages()) {
    for (const v of p.verses) {
      if (v.juz !== juzNumber) continue;
      if (seen.has(v.verse_key)) continue;
      seen.add(v.verse_key);
      keys.push(v.verse_key);
    }
  }
  return keys;
}
