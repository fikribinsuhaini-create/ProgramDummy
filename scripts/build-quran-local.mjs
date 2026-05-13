import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const API_BASE = "https://api.islamic.app/v1";

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

function unwrapData(json) {
  // islamic.app responses: { code, status, data: {...} }
  if (json && typeof json === "object" && "data" in json) return json.data;
  return json;
}

async function main() {
  const outDir = join(process.cwd(), "src", "data");
  await mkdir(outDir, { recursive: true });

  // Arabic (Uthmani) - always available as a full dump.
  const arabicRaw = await fetchJson(`${API_BASE}/quran/verses/uthmani`);
  const arabic = unwrapData(arabicRaw);

  // Translation: default English slug. For Malay, run:
  //   node scripts/build-quran-local.mjs --translation <slug_or_id>
  const args = process.argv.slice(2);
  const tIdx = args.indexOf("--translation");
  const translation = tIdx >= 0 ? args[tIdx + 1] : "en-sahih-international";

  const transRaw = await fetchJson(
    `${API_BASE}/quran/translations/${encodeURIComponent(translation)}`
  );
  const trans = unwrapData(transRaw);

  const transMap = new Map();
  for (const a of trans.ayahs ?? []) transMap.set(a.verse_key, a.text);

  const chaptersRaw = await fetchJson(`${API_BASE}/chapters`);
  const chapters = unwrapData(chaptersRaw);
  const chapterMap = new Map();
  for (const c of chapters.chapters ?? []) {
    chapterMap.set(Number(c.id), {
      nameArabic: c.name_arabic ?? "",
      nameMalay: c.name_simple ?? ""
    });
  }

  // Group into surah structure: { surahs: [{ number, ayahs: [...] }] }
  const surahMap = new Map();
  for (const a of arabic.ayahs ?? []) {
    const [sStr, aStr] = String(a.verse_key).split(":");
    const surah = Number(sStr);
    const ayah = Number(aStr);
    if (!Number.isFinite(surah) || !Number.isFinite(ayah)) continue;

    if (!surahMap.has(surah)) surahMap.set(surah, []);
    surahMap.get(surah).push({
      number: ayah,
      arabic: a.text,
      ms: transMap.get(a.verse_key)
    });
  }

  const surahs = Array.from(surahMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([number, ayahs]) => ({
      number,
      nameArabic: chapterMap.get(number)?.nameArabic ?? "",
      nameMalay: chapterMap.get(number)?.nameMalay ?? "",
      ayahs: ayahs.sort((x, y) => x.number - y.number)
    }));

  const out = {
    meta: {
      source: "api.islamic.app",
      script: "uthmani",
      translation,
      note:
        "Generated file. Fill surah names if needed. Verify translation licensing before redistribution."
    },
    surahs
  };

  const outPath = join(outDir, "quran-full.json");
  await writeFile(outPath, JSON.stringify(out, null, 2), "utf8");
  console.log(`Wrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
