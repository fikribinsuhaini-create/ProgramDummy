"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import quranFull from "@/data/quran-full.json";
import type { Surah } from "@/lib/types";
import { LocalMushafReader } from "@/components/quran/LocalMushafReader";
import { LocalAyahReader } from "@/components/quran/LocalAyahReader";
import { getFirstPageForJuz, getFirstPageForSurah } from "@/lib/mushaf-local";

type ViewMode = "ayah" | "page";
type SourceMode = "juz" | "surah";

export function LocalQuranReader({
  initialSourceMode = "juz",
  initialJuz = 1,
  initialSurah = 1
}: {
  initialSourceMode?: SourceMode;
  initialJuz?: number;
  initialSurah?: number;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("ayah");
  const [sourceMode, setSourceMode] = useState<SourceMode>(initialSourceMode);
  const [juzNumber, setJuzNumber] = useState(initialJuz);
  const [surahNumber, setSurahNumber] = useState(initialSurah);
  const [showTranslation, setShowTranslation] = useState(true);

  const surahs = useMemo(() => (quranFull as unknown as { surahs?: Surah[] }).surahs ?? [], []);
  const surahOptions = useMemo(
    () => surahs.map((s) => ({ id: s.number, label: `${s.number}. ${s.nameMalay}` })),
    [surahs]
  );

  useEffect(() => {
    if (viewMode !== "page") return;
    // When switching selection, jump page reader to the start.
    if (sourceMode === "juz") {
      const p = getFirstPageForJuz(juzNumber);
      if (p) setShowTranslation(false);
      return;
    }
    const p = getFirstPageForSurah(surahNumber);
    if (p) setShowTranslation(false);
  }, [viewMode, sourceMode, juzNumber, surahNumber]);

  const jumpSurah = viewMode === "page" && sourceMode === "surah" ? surahNumber : undefined;
  const jumpJuz = viewMode === "page" && sourceMode === "juz" ? juzNumber : undefined;

  return (
    <div className="grid gap-3">
      <Card className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Mode Bacaan</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Semua local: `quran-full.json` + `mushaf-pages.json`.
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
                setShowTranslation(false);
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

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">Source</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSourceMode("juz")}
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
                onClick={() => setSourceMode("surah")}
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

          {sourceMode === "juz" ? (
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold">Pilih Juz</div>
              <select
                value={juzNumber}
                onChange={(e) => setJuzNumber(Number(e.target.value))}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-400 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    Juz {n}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">Pilih Surah</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSurahNumber((s) => Math.max(1, s - 1))}
                    disabled={surahNumber <= 1}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 shadow-soft disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
                  >
                    {"<"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSurahNumber((s) => Math.min(114, s + 1))}
                    disabled={surahNumber >= 114}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 shadow-soft disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
                  >
                    {">"}
                  </button>
                </div>
              </div>
              <select
                value={surahNumber}
                onChange={(e) => setSurahNumber(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-400 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
              >
                {surahOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {viewMode === "ayah" ? (
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold">Terjemahan</div>
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
              {showTranslation ? "ON" : "OFF"}
            </button>
          </div>
        ) : null}
      </Card>

      {viewMode === "page" ? (
        <LocalMushafReader initialPage={1} jumpSurah={jumpSurah} jumpJuz={jumpJuz} />
      ) : (
        <LocalAyahReader
          mode={sourceMode}
          juzNumber={juzNumber}
          surahNumber={surahNumber}
          showTranslation={showTranslation}
        />
      )}
    </div>
  );
}
