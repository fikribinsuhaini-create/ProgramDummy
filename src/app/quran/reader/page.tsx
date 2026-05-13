import { PageHeader } from "@/components/PageHeader";
import { LocalQuranReader } from "@/components/quran/LocalQuranReader";

export default function QuranReaderPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-5">
      <PageHeader
        title="Al-Quran"
        subtitle="2 mode: Ayat+Terjemahan / Muka Surat (offline)."
        backHref="/quran"
      />
      <div className="mt-4">
        <LocalQuranReader initialSourceMode="surah" initialSurah={1} initialJuz={1} />
      </div>
    </div>
  );
}
