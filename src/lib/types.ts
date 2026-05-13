export type Ayah = {
  number: number;
  arabic: string;
  roman?: string;
  ms?: string;
};

export type Surah = {
  number: number;
  nameArabic: string;
  nameMalay: string;
  ayahs: Ayah[];
};

export type DoaItem = {
  id: string;
  title: string;
  arabic: string;
  roman?: string;
  ms?: string;
  category: string;
};

export type ZikirItem = {
  id: string;
  title: string;
  arabic: string;
  roman?: string;
  ms?: string;
  targetCount?: number;
};

export type SessionItemQuran = {
  type: "quran";
  surah: number;
  fromAyah: number;
  toAyah: number;
  title?: string;
};

export type SessionItemQuranGroup = {
  type: "quran_group";
  title?: string;
  parts: Array<{
    surah: number;
    fromAyah: number;
    toAyah: number;
    title?: string;
  }>;
};

export type SessionItemQuranRemote = {
  type: "quran_remote";
  mode: "chapter_range" | "juz" | "page";
  title?: string;
  surah?: number;
  fromAyah?: number;
  toAyah?: number;
  juzNumber?: number;
  pageNumber?: number;
};

export type SessionItemQuranLocalReader = {
  type: "quran_local_reader";
  title?: string;
  initialSourceMode?: "juz" | "surah";
  initialJuz?: number;
  initialSurah?: number;
};

export type SessionItemDoa = {
  type: "doa";
  ref: string;
  title?: string;
};

export type SessionItemZikir = {
  type: "zikir";
  ref: string;
  title?: string;
  targetCount?: number;
};

export type SessionItem =
  | SessionItemQuran
  | SessionItemQuranGroup
  | SessionItemQuranRemote
  | SessionItemQuranLocalReader
  | SessionItemDoa
  | SessionItemZikir;

export type Session = {
  id: string;
  title: string;
  description?: string;
  author?: string;
  items: SessionItem[];
};
