"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchChapterVerses,
  fetchJuzVerses,
  fetchPageVerses,
  fetchChapters,
  getMalayTranslationIdOrSlug,
  type RemoteChapter,
  type RemoteVerse
} from "@/lib/islamic-api";
import { Card } from "@/components/ui/Card";
import {
  saveProgress,
  toggleBookmark,
  isBookmarked,
  togglePageBookmark,
  isPageBookmarked
} from "@/lib/storage";
import {
  cacheKeyForChapterRange,
  clearCachedRange,
  getCachedRange,
  setCachedRange
} from "@/lib/quran-cache";

type Props =
  | {
      mode: "chapter_range";
      title?: string;
      scopeKey: string;
      surah: number;
      fromAyah: number;
      toAyah: number;
    }
  | {
      mode: "juz";
      title?: string;
      scopeKey: string;
      juzNumber: number;
      allowSurahPicker?: boolean;
    };

type ViewMode = "ayah" | "page";

function toArabicIndic(n: number) {
  const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(n)
    .split("")
    .map((ch) => (ch >= "0" && ch <= "9" ? map[Number(ch)] : ch))
    .join("");
}

function renderAyahMarker(n: number) {
  // Mushaf-like end marker. Example: ۝٥٢
  return `۝${toArabicIndic(n)}`;
}

function ayahNumberFromVerseKey(verseKey: string, fallback?: number) {
  const parts = String(verseKey).split(":");
  const n = Number(parts[1]);
  return Number.isFinite(n) ? n : fallback;
}

function VerseRow({
  verse,
  translationText,
  scopeKey,
  showActions
}: {
  verse: RemoteVerse;
  translationText?: string;
  scopeKey: string;
  showActions: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(isBookmarked(verse.verse_key));
  }, [verse.verse_key]);

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          {verse.verse_key}
        </div>
        {showActions ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const res = toggleBookmark(verse.verse_key, verse.verse_key);
                setBookmarked(res.bookmarked);
              }}
              className={[
                "rounded-full border px-3 py-1 text-xs font-semibold shadow-soft",
                bookmarked
                  ? "border-gold-200 bg-gold-50 text-amber-900 dark:border-gold-600/30 dark:bg-zinc-950/30 dark:text-gold-100"
                  : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-200"
              ].join(" ")}
            >
              {bookmarked ? "Bookmarked" : "Bookmark"}
            </button>
            <button
              type="button"
              onClick={() => saveProgress(scopeKey, verse.verse_key)}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 shadow-soft dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
              Save
            </button>
          </div>
        ) : null}
      </div>

      <div className="arabic-text mt-3 text-3xl leading-[1.9]">
        {verse.text_uthmani}
      </div>

      {translationText ? (
        <div className="mt-3 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
          {translationText}
        </div>
      ) : (
        <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          {showActions
            ? "Terjemahan belum loaded (akan auto bila translation Malay dijumpai)."
            : "Terjemahan disembunyikan dalam mode muka surat."}
        </div>
      )}
    </Card>
  );
}

function PageMushaf({
  verses,
  pageNumber,
  surahName,
  juzNumber,
  chapterNameById
}: {
  verses: RemoteVerse[];
  pageNumber: number;
  surahName?: string;
  juzNumber?: number;
  chapterNameById: Map<number, { simple: string; arabic: string }>;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
        <div className="font-semibold">{surahName ?? "Al-Quran"}</div>
        <div className="flex items-center gap-3 font-semibold tabular-nums">
          {typeof juzNumber === "number" ? <span>Juz {juzNumber}</span> : null}
          <span>Page {pageNumber}</span>
        </div>
      </div>
      <div className="mt-3 arabic-text text-[28px] leading-[2.1] text-zinc-900 dark:text-zinc-100 [text-align:justify]">
        {verses.map((v, idx) => {
          const prev = verses[idx - 1];
          const isNewSurah = !prev || prev.chapter_id !== v.chapter_id;
          const names = chapterNameById.get(v.chapter_id);
          const markerNum = ayahNumberFromVerseKey(v.verse_key, v.verse_number) ?? 0;

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
              {idx === verses.length - 1 ? null : " "}
            </span>
          );
        })}
      </div>
    </Card>
  );
}

export function RemoteQuranReader(props: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verses, setVerses] = useState<RemoteVerse[]>([]);
  const [translationKey, setTranslationKey] = useState<string | undefined>(undefined);
  const [juzNumber, setJuzNumber] = useState<number>(
    props.mode === "juz" ? props.juzNumber : 1
  );
  const [viewMode, setViewMode] = useState<ViewMode>("ayah");
  const [pageNumber, setPageNumber] = useState(1);
  const [chapters, setChapters] = useState<Array<{ id: number; name_simple: string; name_arabic: string }>>([]);
  const [selectedSurah, setSelectedSurah] = useState<number>(36);
  const [pageBookmarked, setPageBookmarked] = useState(false);
  const [sourceMode, setSourceMode] = useState<"juz" | "surah">("juz");

  const scopeKey =
    props.mode === "juz" ? `${props.scopeKey}:juz:${juzNumber}` : props.scopeKey;

  useEffect(() => {
    setPageBookmarked(isPageBookmarked(pageNumber));
  }, [pageNumber]);

  useEffect(() => {
    let cancelled = false;

    async function syncPageToSelection() {
      if (viewMode !== "page") return;

      try {
        // Best-effort: jump page view to selection (juz/surah).
        if (props.mode === "juz") {
          if (props.allowSurahPicker && sourceMode === "surah") {
            const resp = await fetchChapterVerses(selectedSurah, {
              page: 1,
              perPage: 1,
              translation: translationKey
            });
            const v = resp.data?.verses?.[0];
            const p = v?.page;
            if (!cancelled && typeof p === "number" && p > 0) setPageNumber(p);
            return;
          }

          const resp = await fetchJuzVerses(juzNumber, {
            page: 1,
            perPage: 1,
            translation: translationKey
          });
          const v = resp.data?.verses?.[0];
          const p = v?.page;
          if (!cancelled && typeof p === "number" && p > 0) setPageNumber(p);
          return;
        }
      } catch {
        // ignore
      }
    }

    syncPageToSelection();
    return () => {
      cancelled = true;
    };
  }, [
    viewMode,
    props.mode,
    props.allowSurahPicker,
    sourceMode,
    selectedSurah,
    juzNumber,
    translationKey
  ]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const malay = await getMalayTranslationIdOrSlug();
        if (!cancelled) setTranslationKey(malay);

        if ((props.mode === "juz" && props.allowSurahPicker) || viewMode === "page") {
          const ch = await fetchChapters("en");
          if (!cancelled) {
            setChapters(
              (ch.data?.chapters ?? []).map((c: RemoteChapter) => ({
                id: Number(c.id),
                name_simple: String(c.name_simple ?? ""),
                name_arabic: String(c.name_arabic ?? "")
              }))
            );
          }
        }

        if (viewMode === "page") {
          const resp = await fetchPageVerses(pageNumber, { translation: malay });
          const list = resp.data?.verses ?? [];
          if (!cancelled) setVerses(list);
          return;
        }

        if (props.mode === "chapter_range") {
          const ck = cacheKeyForChapterRange(
            props.surah,
            props.fromAyah,
            props.toAyah,
            malay
          );
          const cached = getCachedRange(ck);
          if (cached?.verses?.length) {
            setVerses(cached.verses);
            setLoading(false);
            // continue to refresh in background (best effort)
          }
        }

        const perPage = 250;
        let page = 1;
        let all: RemoteVerse[] = [];

        while (true) {
          const resp =
            props.mode === "juz"
              ? props.allowSurahPicker && sourceMode === "surah"
                ? await fetchChapterVerses(selectedSurah, {
                    page,
                    perPage,
                    translation: malay
                  })
                : await fetchJuzVerses(juzNumber, {
                  page,
                  perPage,
                  translation: malay
                })
              : await fetchChapterVerses(props.surah, {
                  page,
                  perPage,
                  translation: malay
                });

          all = all.concat(resp.data?.verses ?? []);

          const next = resp.pagination?.next_page ?? null;
          if (!next) break;
          page = next;
        }

        if (cancelled) return;

        if (props.mode === "chapter_range") {
          all = all.filter(
            (v) => v.verse_number >= props.fromAyah && v.verse_number <= props.toAyah
          );
        }

        setVerses(all);

        if (props.mode === "chapter_range") {
          const ck = cacheKeyForChapterRange(
            props.surah,
            props.fromAyah,
            props.toAyah,
            malay
          );
          setCachedRange(ck, { cachedAt: Date.now(), translationKey: malay, verses: all });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [props, juzNumber, viewMode, pageNumber, selectedSurah, sourceMode]);

  const translationByVerseKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of verses) {
      const t = v.translations?.[0]?.text;
      if (t) map.set(v.verse_key, t.replace(/<[^>]*>/g, ""));
    }
    return map;
  }, [verses]);

  if (loading) {
    return (
      <Card>
        <div className="text-sm text-zinc-700 dark:text-zinc-300">
          Loading Quran data…
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Gagal load Quran data
        </div>
        <div className="mt-2 break-words text-xs text-zinc-600 dark:text-zinc-400">
          {error}
        </div>
        {props.mode === "chapter_range" ? (
          <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
            Tip: buka sekali masa online untuk auto cache. Lepas tu boleh baca offline.
          </div>
        ) : null}
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {props.mode === "juz" ? (
        <Card className="p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold">Pilih Juz</div>
              <select
                value={juzNumber}
                onChange={(e) => setJuzNumber(Number(e.target.value))}
                disabled={props.allowSurahPicker && sourceMode === "surah"}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    Juz {n}
                  </option>
                ))}
              </select>
            </div>

            {props.allowSurahPicker ? (
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">Mode</div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSourceMode("juz");
                        setLoading(true);
                      }}
                      className={[
                        "rounded-xl px-3 py-2 text-xs font-semibold shadow-soft",
                        sourceMode === "juz"
                          ? "bg-emerald-600 text-white"
                          : "border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
                      ].join(" ")}
                    >
                      Juz
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSourceMode("surah");
                        setLoading(true);
                      }}
                      className={[
                        "rounded-xl px-3 py-2 text-xs font-semibold shadow-soft",
                        sourceMode === "surah"
                          ? "bg-emerald-600 text-white"
                          : "border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
                      ].join(" ")}
                    >
                      Surah
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">Pilih Surah</div>
                  <select
                    value={selectedSurah}
                    onChange={(e) => setSelectedSurah(Number(e.target.value))}
                    disabled={sourceMode !== "surah" || chapters.length === 0}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
                  >
                    {chapters.length === 0 ? (
                      <option value={selectedSurah}>Loading…</option>
                    ) : (
                      chapters.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.id}. {c.name_simple}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}

      <Card className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Mode Bacaan</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Page mode hide terjemahan + bookmark page.
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode("ayah")}
              className={[
                "rounded-2xl px-4 py-2 text-xs font-semibold shadow-soft",
                viewMode === "ayah"
                  ? "bg-emerald-600 text-white"
                  : "border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
              ].join(" ")}
            >
              Ayat + Terjemahan
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode("page");
                setLoading(true);
              }}
              className={[
                "rounded-2xl px-4 py-2 text-xs font-semibold shadow-soft",
                viewMode === "page"
                  ? "bg-emerald-600 text-white"
                  : "border border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
              ].join(" ")}
            >
              Muka Surat
            </button>
          </div>
        </div>

        {viewMode === "page" ? (
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 shadow-soft dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
              >
                Prev
              </button>
              <div className="text-sm font-semibold tabular-nums">Page {pageNumber}</div>
              <button
                type="button"
                onClick={() => setPageNumber((p) => Math.min(604, p + 1))}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 shadow-soft dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
              >
                Next
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const res = togglePageBookmark(pageNumber, `Page ${pageNumber}`);
                setPageBookmarked(res.bookmarked);
              }}
              className={[
                "rounded-2xl border px-4 py-2 text-xs font-semibold shadow-soft",
                (pageBookmarked || isPageBookmarked(pageNumber))
                  ? "border-gold-200 bg-gold-50 text-amber-900 dark:border-gold-600/30 dark:bg-zinc-950/30 dark:text-gold-100"
                  : "border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
              ].join(" ")}
            >
              {(pageBookmarked || isPageBookmarked(pageNumber)) ? "Bookmarked" : "Bookmark"}
            </button>
          </div>
        ) : null}
      </Card>

      {props.mode === "chapter_range" ? (
        <Card className="p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Offline cache</div>
              <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                Cache range untuk baca tanpa internet (selepas sekali load).
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const ck = cacheKeyForChapterRange(
                  props.surah,
                  props.fromAyah,
                  props.toAyah,
                  translationKey
                );
                clearCachedRange(ck);
              }}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-900 shadow-soft dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
            >
              Clear cache
            </button>
          </div>
        </Card>
      ) : null}
      <div className="text-xs text-zinc-600 dark:text-zinc-400">
        Source: api.islamic.app • Malay translation:{" "}
        <span className="font-mono">{translationKey ?? "auto"}</span>
      </div>

      {viewMode === "page" ? (
        <PageMushaf
          verses={verses}
          pageNumber={pageNumber}
          surahName={
            verses[0]?.chapter_id
              ? chapters.find((c) => c.id === verses[0].chapter_id)?.name_simple
              : undefined
          }
          juzNumber={verses[0]?.juz}
          chapterNameById={
            new Map(
              chapters.map((c) => [
                c.id,
                { simple: c.name_simple, arabic: c.name_arabic }
              ])
            )
          }
        />
      ) : (
        verses.map((v) => (
          <VerseRow
            key={v.verse_key}
            verse={v}
            translationText={translationByVerseKey.get(v.verse_key)}
            scopeKey={scopeKey}
            showActions
          />
        ))
      )}
    </div>
  );
}
