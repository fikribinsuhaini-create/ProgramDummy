"use client";

import { useMemo } from "react";
import quranFull from "@/data/quran-full.json";
import { Card } from "@/components/ui/Card";
import type { Ayah, Surah } from "@/lib/types";
import { getVerseKeysForJuz } from "@/lib/mushaf-local";

function AyahRow({ verseKey, ayah, showTranslation }: { verseKey: string; ayah: Ayah; showTranslation: boolean }) {
  return (
    <Card>
      <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{verseKey}</div>
      <div className="arabic-text mt-2 text-3xl leading-[1.9]">{ayah.arabic}</div>
      {showTranslation ? (
        <div className="mt-3 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
          {ayah.ms ?? "(tiada terjemahan dalam quran-full.json)"}
        </div>
      ) : null}
    </Card>
  );
}

export function LocalAyahReader({
  mode,
  juzNumber,
  surahNumber,
  showTranslation
}: {
  mode: "juz" | "surah";
  juzNumber: number;
  surahNumber: number;
  showTranslation: boolean;
}) {
  const surahs = useMemo(() => (quranFull as unknown as { surahs?: Surah[] }).surahs ?? [], []);
  const surahByNumber = useMemo(() => new Map(surahs.map((s) => [s.number, s])), [surahs]);

  const verseKeys = useMemo(() => {
    if (mode === "juz") return getVerseKeysForJuz(juzNumber);
    const s = surahByNumber.get(surahNumber);
    if (!s) return [];
    return s.ayahs.map((a) => `${surahNumber}:${a.number}`);
  }, [mode, juzNumber, surahNumber, surahByNumber]);

  const ayahByVerseKey = useMemo(() => {
    const map = new Map<string, Ayah>();
    for (const s of surahs) {
      for (const a of s.ayahs) map.set(`${s.number}:${a.number}`, a);
    }
    return map;
  }, [surahs]);

  return (
    <div className="grid gap-3">
      {verseKeys.map((vk) => {
        const ayah = ayahByVerseKey.get(vk);
        if (!ayah) return null;
        return <AyahRow key={vk} verseKey={vk} ayah={ayah} showTranslation={showTranslation} />;
      })}
    </div>
  );
}
