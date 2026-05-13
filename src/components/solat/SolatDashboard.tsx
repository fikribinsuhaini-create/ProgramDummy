"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { DEFAULT_ZONE, SOLAT_ZONES_FALLBACK, type SolatZone } from "@/lib/solat/zones";
import { clearZonesCache, fetchAllZones } from "@/lib/solat/locations";
import { MalaysiaMapModal } from "@/components/solat/MalaysiaMapModal";
import {
  buildPrayerTimes,
  fetchTakwimToday,
  formatCountdown,
  getNextPrayer,
  type JakimTakwimRow,
  type PrayerTime
} from "@/lib/solat/jakim";

const ZONE_KEY = "pbul:solat:zone:v1";
const FORMAT_KEY = "pbul:solat:12h:v1";

function saveZone(zone: string) {
  window.localStorage.setItem(ZONE_KEY, zone);
}

export function SolatDashboard() {
  // IMPORTANT: do not read localStorage during render to avoid hydration mismatch.
  const [zone, setZone] = useState(DEFAULT_ZONE);
  const [zones, setZones] = useState<SolatZone[]>(SOLAT_ZONES_FALLBACK);
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [codeFilter, setCodeFilter] = useState<string[] | null>(null);
  const [row, setRow] = useState<JakimTakwimRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [mapOpen, setMapOpen] = useState(false);
  const [use12h, setUse12h] = useState(true);

  function normalizeState(s: string) {
    const x = s.trim().toLowerCase();
    if (x.startsWith("w.p")) return "Wilayah Persekutuan";
    if (x.includes("pulau pinang") || x.includes("penang")) return "Pulau Pinang";
    if (x.includes("negeri sembilan") || x.includes("n. sembilan")) return "Negeri Sembilan";
    return s;
  }

  useEffect(() => {
    // hydrate preferences from localStorage (client only)
    try {
      const z = window.localStorage.getItem(ZONE_KEY);
      if (z) setZone(z.toUpperCase());
    } catch {
      // ignore
    }
    try {
      const v = window.localStorage.getItem(FORMAT_KEY);
      setUse12h((v ?? "true") === "true");
    } catch {
      // ignore
    }
  }, []);

  // keep filter in sync with current zone
  useEffect(() => {
    const st = zones.find((x) => x.code === zone)?.state ?? null;
    if (!st) return;
    if (zone === "WLY01") {
      setCodeFilter(["WLY01"]);
      setStateFilter(null);
      return;
    }
    if (zone === "WLY02") {
      setCodeFilter(["WLY02"]);
      setStateFilter(null);
      return;
    }
    setCodeFilter(null);
    setStateFilter(normalizeState(st));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone, zones.length]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchAllZones().then((z) => {
      if (cancelled) return;
      setZones(z);
      // If current zone not in list, reset to default so <select> stays controllable.
      if (!z.some((x) => x.code === zone)) {
        setZone(DEFAULT_ZONE);
        saveZone(DEFAULT_ZONE);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [zone]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setRow(null);
    fetchTakwimToday(zone)
      .then((r) => {
        if (cancelled) return;
        setRow(r);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Unknown error");
      });
    return () => {
      cancelled = true;
    };
  }, [zone]);

  const times: PrayerTime[] = useMemo(() => (row ? buildPrayerTimes(row) : []), [row]);
  const next = useMemo(() => getNextPrayer(times, now), [times, now]);
  const countdown = useMemo(() => {
    if (!next) return null;
    return formatCountdown(next.at.getTime() - now.getTime());
  }, [next, now]);

  const fmtTime = (t: PrayerTime) => {
    if (!use12h) return t.time;
    const [hhStr, mmStr] = t.time.split(":");
    const hh = Number(hhStr);
    const mm = Number(mmStr);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return t.time;
    const ampm = hh >= 12 ? "PM" : "AM";
    const h12 = ((hh + 11) % 12) + 1;
    const pad2 = (n: number) => String(n).padStart(2, "0");
    return `${h12}:${pad2(mm)} ${ampm}`;
  };

  const zoneLabel = useMemo(() => {
    const z = zones.find((x) => x.code === zone);
    return z ? `${z.code} • ${z.state}` : zone;
  }, [zone, zones]);

  const filteredZones = useMemo(() => {
    if (codeFilter && codeFilter.length > 0) {
      const allow = new Set(codeFilter);
      return zones.filter((z) => allow.has(z.code));
    }
    if (!stateFilter) return zones;
    return zones.filter((z) => normalizeState(z.state) === stateFilter);
  }, [zones, stateFilter, codeFilter]);

  return (
    <div className="grid gap-3">
      <MalaysiaMapModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        onPickState={(stateKey) => {
          const raw = stateKey.trim();

          if (raw === "Labuan") {
            setCodeFilter(["WLY02"]);
            setStateFilter(null);
            setZone("WLY02");
            saveZone("WLY02");
            return;
          }
          if (raw === "Putrajaya" || raw === "Kuala Lumpur") {
            setCodeFilter(["WLY01"]);
            setStateFilter(null);
            setZone("WLY01");
            saveZone("WLY01");
            return;
          }

          const target = normalizeState(raw);
          const list = zones
            .filter((z) => normalizeState(z.state) === target)
            .sort((a, b) => a.code.localeCompare(b.code));
          const first = list[0];
          if (first) {
            setCodeFilter(null);
            setStateFilter(target);
            setZone(first.code);
            saveZone(first.code);
          }
        }}
      />
      <Card className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Zon
            </div>
            <div className="mt-1 text-base font-semibold">{zoneLabel}</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {zones.find((x) => x.code === zone)?.label ?? ""}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-soft"
            >
              Pilih Negeri (Peta)
            </button>
            {stateFilter || codeFilter ? (
              <button
                type="button"
                onClick={() => {
                  setStateFilter(null);
                  setCodeFilter(null);
                }}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 shadow-soft dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
              >
                Tunjuk semua zon
              </button>
            ) : null}
            <select
              value={zone}
              onChange={(e) => {
                const z = e.target.value;
                setZone(z);
                saveZone(z);
                const st = zones.find((x) => x.code === z)?.state ?? null;
                if (z === "WLY01") {
                  setCodeFilter(["WLY01"]);
                  setStateFilter(null);
                } else if (z === "WLY02") {
                  setCodeFilter(["WLY02"]);
                  setStateFilter(null);
                } else {
                  setCodeFilter(null);
                  setStateFilter(st ? normalizeState(st) : null);
                }
              }}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-400 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
            >
              {filteredZones.map((z) => (
                <option key={z.code} value={z.code}>
                  {z.code} — {z.state}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                clearZonesCache();
                // force re-fetch
                fetchAllZones().then((z) => setZones(z));
              }}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 shadow-soft dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
            >
              {/* Reload zon */}
            </button>
            <button
              type="button"
              onClick={() => {
                const next = !use12h;
                setUse12h(next);
                window.localStorage.setItem(FORMAT_KEY, String(next));
              }}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 shadow-soft dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
            >
              Format: {use12h ? "12 jam" : "24 jam"}
            </button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          Waktu solat seterusnya
        </div>
        {error ? (
          <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
        ) : null}
        {!row && !error ? (
          <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            Loading…
          </div>
        ) : null}
        {next ? (
          <div className="mt-2 flex items-end justify-between">
            <div>
              <div className="text-2xl font-semibold">{next.label}</div>
              <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                {fmtTime(next)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Countdown
              </div>
              <div className="mt-1 font-mono text-2xl font-semibold">
                {countdown ?? "--:--:--"}
              </div>
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="p-4">
        <div className="text-sm font-semibold">Waktu Solat Hari Ini</div>
        <div className="mt-3 grid gap-2">
          {times.map((t) => (
            <div
              key={t.key}
              className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white/60 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/20"
            >
              <div className="text-sm font-semibold">{t.label}</div>
              <div className="font-mono text-sm font-semibold">{fmtTime(t)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
