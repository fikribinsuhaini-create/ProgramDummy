"use client";

import { useEffect, useMemo, useState } from "react";
import quranFull from "@/data/quran-full.json";
import { getFirstPageForJuz, getFirstPageForSurah, getMushafPage } from "@/lib/mushaf-local";
import { Card } from "@/components/ui/Card";
import { togglePageBookmark, isPageBookmarked } from "@/lib/storage";

type Surah = {
  number: number;
  nameArabic: string;
  nameMalay: string;
  ayahs: Array<{ number: number; arabic: string; ms?: string }>;
};

type PageVerseRef = { verse_key: string; chapter_id: number; juz?: number; page?: number };

function toArabicIndic(n: number) {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n)
    .split("")
    .map((ch) => (ch >= "0" && ch <= "9" ? map[Number(ch)] : ch))
    .join("");
}

function renderAyahMarker(n: number) {
  return `۝${toArabicIndic(n)}`;
}

function ayahNumberFromVerseKey(verseKey: string) {
  const parts = String(verseKey).split(":");
  const n = Number(parts[1]);
  return Number.isFinite(n) ? n : 0;
}

function buildVerseTextIndex(surahs: Surah[]) {
  const map = new Map<string, { arabic: string; ms?: string; chapter_id: number }>();
  for (const s of surahs) {
    for (const a of s.ayahs) {
      map.set(`${s.number}:${a.number}`, { arabic: a.arabic, ms: a.ms, chapter_id: s.number });
    }
  }
  return map;
}

export function LocalMushafReader({
  initialPage = 1,
  jumpSurah,
  jumpJuz
}: {
  initialPage?: number;
  jumpSurah?: number;
  jumpJuz?: number;
}) {
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [showTranslation, setShowTranslation] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const surahs = (quranFull as any).surahs as Surah[] | undefined;
  const chapterNameById = useMemo(() => {
    const map = new Map<number, { simple: string; arabic: string }>();
    for (const s of surahs ?? []) map.set(s.number, { simple: s.nameMalay, arabic: s.nameArabic });
    return map;
  }, [surahs]);

  const verseIndex = useMemo(() => buildVerseTextIndex(surahs ?? []), [surahs]);

  const current = useMemo(() => {
    const page = getMushafPage(pageNumber);
    if (!page) return { page: pageNumber, verses: [] as PageVerseRef[] };
    return page;
  }, [pageNumber]);

  // Jump requests (from parent reader)
  useEffect(() => {
    if (typeof jumpSurah === "number") {
      const p = getFirstPageForSurah(jumpSurah);
      if (p) setPageNumber(p);
    }
    if (typeof jumpJuz === "number") {
      const p = getFirstPageForJuz(jumpJuz);
      if (p) setPageNumber(p);
    }
  }, [jumpSurah, jumpJuz]);

  const pageVerses = useMemo(() => {
    return current.verses
      .map((ref) => {
        const v = verseIndex.get(ref.verse_key);
        if (!v) return null;
        return {
          verse_key: ref.verse_key,
          chapter_id: ref.chapter_id,
          text_uthmani: v.arabic,
          translation: v.ms
        };
      })
      .filter(Boolean) as Array<{
      verse_key: string;
      chapter_id: number;
      text_uthmani: string;
      translation?: string;
    }>;
  }, [current.verses, verseIndex]);

  const surahTitle = useMemo(() => {
    const firstChapter = pageVerses[0]?.chapter_id;
    if (!firstChapter) return undefined;
    return chapterNameById.get(firstChapter)?.simple;
  }, [pageVerses, chapterNameById]);

  return (
    <div className="grid gap-3">
      <Card className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 shadow-soft dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
            >
              Prev
            </button>
            <div className="text-sm font-semibold tabular-nums">
              {surahTitle ?? "Al-Quran"} •{" "}
              {typeof current.juz === "number" ? `Juz ${current.juz} • ` : ""}
              Page {pageNumber}
            </div>
            <button
              type="button"
              onClick={() => setPageNumber((p) => Math.min(604, p + 1))}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 shadow-soft dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
            >
              Next
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTranslation((v) => !v)}
              className={[
                "rounded-xl px-3 py-2 text-xs font-semibold shadow-soft",
                showTranslation
                  ? "bg-emerald-600 text-white"
                  : "border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
              ].join(" ")}
            >
              {showTranslation ? "Terjemahan ON" : "Terjemahan OFF"}
            </button>
            <button
              type="button"
              onClick={() => {
                const res = togglePageBookmark(pageNumber, `Page ${pageNumber}`);
                setBookmarked(res.bookmarked);
              }}
              className={[
                "rounded-2xl border px-4 py-2 text-xs font-semibold shadow-soft",
                bookmarked || isPageBookmarked(pageNumber)
                  ? "border-gold-200 bg-gold-50 text-amber-900 dark:border-gold-600/30 dark:bg-zinc-950/30 dark:text-gold-100"
                  : "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
              ].join(" ")}
            >
              {bookmarked || isPageBookmarked(pageNumber) ? "Bookmarked" : "Bookmark"}
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="mt-1 arabic-text text-[28px] leading-[2.1] text-zinc-900 dark:text-zinc-100 [text-align:justify]">
          {pageVerses.map((v, idx) => {
            const prev = pageVerses[idx - 1];
            const isNewSurah = !prev || prev.chapter_id !== v.chapter_id;
            const names = chapterNameById.get(v.chapter_id);
            const markerNum = ayahNumberFromVerseKey(v.verse_key);

            return (
              <span key={v.verse_key}>
                {isNewSurah ? (
                  <span className="my-3 block w-full rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-center text-sm font-semibold text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
                    <span className="arabic-text block text-xl leading-[1.4]">
                      {names?.arabic ?? `سورة ${v.chapter_id}`}
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-emerald-900/80 dark:text-emerald-100/80">
                      {names?.simple ?? `Surah ${v.chapter_id}`}
                    </span>
                  </span>
                ) : null}

                {v.text_uthmani}{" "}
                <span className="mx-1 text-emerald-800 dark:text-emerald-200">
                  {renderAyahMarker(markerNum)}
                </span>
                {idx === pageVerses.length - 1 ? null : " "}
              </span>
            );
          })}
        </div>

        {showTranslation ? (
          <div className="mt-5 grid gap-3">
            {pageVerses.map((v) => (
              <div key={`${v.verse_key}:t`} className="text-sm text-zinc-800 dark:text-zinc-200">
                <span className="font-semibold">{v.verse_key}</span>{" "}
                <span className="text-zinc-600 dark:text-zinc-400">—</span>{" "}
                <span>{v.translation ?? "(tiada terjemahan dalam quran-full.json)"}</span>
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
