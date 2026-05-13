# ProgramByUstazLah (MVP)

Web app / PWA (Next.js + Tailwind) untuk:
- Al-Quran (rujuk data `quran.json`)
- Koleksi doa
- Koleksi zikir + counter
- Session / Program Amalan (guided flow, hanya simpan reference)
- Waktu solat (JAKIM e-Solat)

## Jalanankan (local)

```bash
npm install
npm run dev
```

Kemudian buka `http://localhost:3000`.

## Data

- `src/data/quran.json`
- `src/data/doa.json`
- `src/data/zikir.json`
- `src/data/sessions.json`

Nota: App akan auto guna `src/data/quran-full.json` jika wujud (quran lengkap). Jika tiada, ia fallback ke `src/data/quran.json` (demo ringkas).

## Waktu Solat (JAKIM)

Tab `Solat` guna proxy API Next.js: `GET /api/solat?zone=SGR01&period=today` (upstream `solat.my`).

## Quran full dalam JSON (optional)

Quran teks Arab + terjemahan boleh dijana jadi fail local `src/data/quran-full.json` (besar). Script:

```bash
node scripts/build-quran-local.mjs
```

Tukar terjemahan (slug/id):

```bash
node scripts/build-quran-local.mjs --translation <slug_atau_id>
```

Nota: semak lesen/izin terjemahan sebelum distribute.

## Mushaf (offline muka surat)

Generate mapping `page -> verse_key` (604 pages) untuk mode muka surat offline:

```bash
node scripts/build-mushaf-pages.mjs
```

Lepas ada `src/data/mushaf-pages.json`, mode `Muka Surat` akan guna mapping offline (style mushaf).

## Nota build (Windows/Codex)

Kalau `npm run build` fail dengan `spawn EPERM` dalam environment tertentu (contoh sandbox/AV/permission), cuba build/deploy dari environment lain (Vercel / Linux) — app tidak bergantung pada Windows-only behaviour.

Nota: kalau dah pernah generate, run semula selepas update script untuk simpan metadata `juz` per ayat (supaya reader juz offline tepat).
