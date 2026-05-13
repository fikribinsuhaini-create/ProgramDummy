import quran from "@/data/quran.json";
import quranFull from "@/data/quran-full.json";
import doa from "@/data/doa.json";
import zikir from "@/data/zikir.json";
import sessions from "@/data/sessions.json";
import type { DoaItem, Session, Surah, ZikirItem } from "@/lib/types";

function getQuranData(): { surahs: Surah[] } {
  const full = quranFull as unknown as { surahs?: Surah[] };
  if (Array.isArray(full.surahs) && full.surahs.length > 0) return { surahs: full.surahs };
  return quran as unknown as { surahs: Surah[] };
}

export function getSurahs(): Surah[] {
  return getQuranData().surahs;
}

export function getSurahByNumber(number: number): Surah | undefined {
  return getSurahs().find((s) => s.number === number);
}

export function getDoaItems(): DoaItem[] {
  return doa.items as DoaItem[];
}

export function getDoaById(id: string): DoaItem | undefined {
  return getDoaItems().find((d) => d.id === id);
}

export function getZikirItems(): ZikirItem[] {
  return zikir.items as ZikirItem[];
}

export function getZikirById(id: string): ZikirItem | undefined {
  return getZikirItems().find((z) => z.id === id);
}

export function getSessions(): Session[] {
  return sessions.items as Session[];
}

export function getSessionById(id: string): Session | undefined {
  return getSessions().find((s) => s.id === id);
}
