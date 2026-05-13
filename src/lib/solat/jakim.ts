"use client";

export type JakimTakwimRow = {
  date: string;
  hijri: string;
  day: string;
  imsak: string;
  fajr: string; // Subuh
  syuruk: string;
  dhuhr: string; // Zohor
  asr: string;
  maghrib: string;
  isha: string;
};

export type JakimTakwimResponse = {
  prayerTime: JakimTakwimRow[];
  status?: string;
  serverTime?: string;
};

export async function fetchTakwimToday(zone: string): Promise<JakimTakwimRow | null> {
  const res = await fetch(`/api/solat?zone=${encodeURIComponent(zone)}&period=today`, {
    cache: "no-store"
  });
  if (!res.ok) throw new Error(`API failed: ${res.status}`);
  const json = (await res.json()) as { ok: boolean; data?: JakimTakwimResponse };
  const row = json.data?.prayerTime?.[0];
  return row ?? null;
}

const MONTHS: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Mac: 2,
  Apr: 3,
  May: 4,
  Mei: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Ogo: 7,
  Sep: 8,
  Oct: 9,
  Okt: 9,
  Nov: 10,
  Dec: 11,
  Dis: 11
};

export function parseJakimDateTime(dateStr: string, timeStr: string) {
  // Expected: "09-Apr-2026" and "19:26:00"
  const [dd, mmm, yyyy] = dateStr.split("-");
  const month = MONTHS[mmm] ?? 0;
  const day = Number(dd);
  const year = Number(yyyy);
  const [hh, mm, ss] = timeStr.split(":").map((x) => Number(x));
  return new Date(year, month, day, hh || 0, mm || 0, ss || 0);
}

export type PrayerKey =
  | "imsak"
  | "subuh"
  | "syuruk"
  | "zohor"
  | "asar"
  | "maghrib"
  | "isyak";

export type PrayerTime = {
  key: PrayerKey;
  label: string;
  time: string;
  at: Date;
};

export function buildPrayerTimes(row: JakimTakwimRow): PrayerTime[] {
  const date = row.date;
  return [
    { key: "imsak", label: "Imsak", time: row.imsak, at: parseJakimDateTime(date, row.imsak) },
    { key: "subuh", label: "Subuh", time: row.fajr, at: parseJakimDateTime(date, row.fajr) },
    { key: "syuruk", label: "Syuruk", time: row.syuruk, at: parseJakimDateTime(date, row.syuruk) },
    { key: "zohor", label: "Zohor", time: row.dhuhr, at: parseJakimDateTime(date, row.dhuhr) },
    { key: "asar", label: "Asar", time: row.asr, at: parseJakimDateTime(date, row.asr) },
    { key: "maghrib", label: "Maghrib", time: row.maghrib, at: parseJakimDateTime(date, row.maghrib) },
    { key: "isyak", label: "Isyak", time: row.isha, at: parseJakimDateTime(date, row.isha) }
  ];
}

export function getNextPrayer(times: PrayerTime[], now = new Date()) {
  for (const t of times) {
    if (t.at.getTime() > now.getTime()) return t;
  }
  return null;
}

export function formatCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
}
