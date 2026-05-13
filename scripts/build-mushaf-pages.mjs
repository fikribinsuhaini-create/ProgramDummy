import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const API_BASE = "https://api.islamic.app/v1";
const TOTAL_PAGES = 604;

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function fetchPage(page) {
  const url = `${API_BASE}/verses/by_page/${page}?fields=text_uthmani&words=false&per_page=999`;
  const json = await fetchJson(url);
  const verses = json.data?.verses ?? [];
  const first = verses[0];
  return {
    page,
    juz: typeof first?.juz === "number" ? first.juz : undefined,
    verses: verses.map((v) => ({
      verse_key: v.verse_key,
      chapter_id: v.chapter_id,
      juz: v.juz,
      page: v.page
    }))
  };
}

async function main() {
  const outDir = join(process.cwd(), "src", "data");
  await mkdir(outDir, { recursive: true });

  const pages = [];
  // Simple sequential to be kind to API; 604 calls.
  for (let p = 1; p <= TOTAL_PAGES; p++) {
    if (p % 25 === 0) process.stdout.write(`page ${p}/${TOTAL_PAGES}\n`);
    pages.push(await fetchPage(p));
  }

  const out = {
    meta: {
      source: "api.islamic.app",
      note: "Mapping mushaf pages (1..604) to verse_key for offline page mode."
    },
    pages
  };

  const outPath = join(outDir, "mushaf-pages.json");
  await writeFile(outPath, JSON.stringify(out), "utf8");
  console.log(`Wrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
