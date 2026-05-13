"use client";

import type { SolatZone } from "@/lib/solat/zones";
import { SOLAT_ZONES_FALLBACK } from "@/lib/solat/zones";

type SolatMyLocation = {
  code: string;
  state: string;
  location?: string;
  latitude?: string;
  longitude?: string;
};

const CACHE_KEY = "pbul:solat:locations:v1";

type ZonesCache = { cachedAt: number; zones: SolatZone[] };

export function clearZonesCache() {
  try {
    window.localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}

export async function fetchAllZones(): Promise<SolatZone[]> {
  try {
    const cached = window.localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as unknown;
      // Backward compat: previously stored as array directly.
      if (Array.isArray(parsed) && parsed.length > 10) return parsed as SolatZone[];
      // New format: { zones, cachedAt }
      if (parsed && typeof parsed === "object") {
        const maybe = parsed as Partial<ZonesCache>;
        if (Array.isArray(maybe.zones) && maybe.zones.length > 10) return maybe.zones;
      }
    }
  } catch {
    // ignore
  }

  try {
    // Use local proxy to avoid any browser CORS issues.
    const res = await fetch("/api/solat/locations", { cache: "no-store" });
    if (!res.ok) throw new Error(`locations failed: ${res.status}`);
    const wrap = (await res.json()) as { ok: boolean; data?: unknown };
    const list = (wrap.data as SolatMyLocation[]) ?? [];

    const byCode = new Map<string, SolatZone>();
    for (const item of list) {
      const code = String(item.code ?? "").toUpperCase();
      if (!code) continue;
      const state = String(item.state ?? "");
      const loc = String(item.location ?? "").trim();
      const existing = byCode.get(code);
      if (!existing) {
        byCode.set(code, { code, state, label: loc });
      } else if (loc && !existing.label.includes(loc)) {
        byCode.set(code, { ...existing, label: existing.label ? `${existing.label}, ${loc}` : loc });
      }
    }

    const zones = Array.from(byCode.values()).sort((a, b) => a.code.localeCompare(b.code));
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ cachedAt: Date.now(), zones }));
    return zones;
  } catch {
    return SOLAT_ZONES_FALLBACK;
  }
}
