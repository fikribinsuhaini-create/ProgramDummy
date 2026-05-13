"use client";

import quran from "@/data/quran.json";
import quranFull from "@/data/quran-full.json";
import doa from "@/data/doa.json";
import zikir from "@/data/zikir.json";
import type { Ayah, DoaItem, Surah, ZikirItem } from "@/lib/types";

function getSurahsClient(): Surah[] {
  const full = quranFull as unknown as { surahs?: Surah[] };
  if (Array.isArray(full.surahs) && full.surahs.length > 0) return full.surahs;
  return quran.surahs as Surah[];
}

export function getQuranRangeClient(
  surahNumber: number,
  fromAyah: number,
  toAyah: number
): Ayah[] {
  const surah = getSurahsClient().find((s) => s.number === surahNumber);
  if (!surah) return [];

  const start = Math.max(1, Math.min(fromAyah, toAyah));
  const end = Math.max(start, Math.max(fromAyah, toAyah));

  return surah.ayahs.filter((a) => a.number >= start && a.number <= end);
}

export function getDoaByIdClient(id: string): DoaItem | undefined {
  return (doa.items as DoaItem[]).find((d) => d.id === id);
}

export function getZikirByIdClient(id: string): ZikirItem | undefined {
  return (zikir.items as ZikirItem[]).find((z) => z.id === id);
}
