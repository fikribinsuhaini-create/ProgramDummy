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

Nota: Untuk demo sekarang, `quran.json` hanya ada beberapa surah contoh. Struktur fail sengaja dibuat supaya boleh diganti dengan quran lengkap tanpa ubah UI (session tetap hanya simpan reference).

## Waktu Solat (JAKIM)

Tab `Solat` guna proxy API Next.js: `GET /api/solat?zone=SGR01&period=today` (upstream `www.e-solat.gov.my`).

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

Lepas ada `src/data/mushaf-pages.json`, page `Quran -> Baca macam Mushaf` akan guna mode offline.

Nota: kalau dah pernah generate, run semula selepas update script untuk simpan metadata `juz` per ayat (supaya reader juz offline tepat).
