"use client";

import type { RemoteVerse } from "@/lib/islamic-api";

type CachedRange = {
  cachedAt: number;
  translationKey?: string;
  verses: RemoteVerse[];
};

const KEY = "pbul:quran_cache:v1";

function safeParse(raw: string | null): Record<string, CachedRange> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, CachedRange>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function loadAll(): Record<string, CachedRange> {
  if (typeof window === "undefined") return {};
  return safeParse(window.localStorage.getItem(KEY));
}

function saveAll(map: Record<string, CachedRange>) {
  window.localStorage.setItem(KEY, JSON.stringify(map));
}

export function cacheKeyForChapterRange(
  chapter: number,
  fromAyah: number,
  toAyah: number,
  translationKey?: string
) {
  return `chapter:${chapter}:${fromAyah}-${toAyah}:t:${translationKey ?? "none"}`;
}

export function getCachedRange(key: string): CachedRange | undefined {
  const all = loadAll();
  return all[key];
}

export function setCachedRange(key: string, value: CachedRange) {
  const all = loadAll();
  all[key] = value;
  saveAll(all);
}

export function clearCachedRange(key: string) {
  const all = loadAll();
  delete all[key];
  saveAll(all);
}

