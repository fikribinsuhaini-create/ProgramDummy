import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { getSurahByNumber } from "@/lib/data";
import { AyahCard } from "@/components/quran/AyahCard";

export default async function SurahPage({ params }: { params: Promise<{ surah: string }> }) {
  const { surah: surahParam } = await params;
  const number = Number(surahParam);
  if (!Number.isFinite(number)) return notFound();

  const surahData = getSurahByNumber(number);
  if (!surahData) return notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-5">
      <PageHeader
        title={`Surah ${surahData.nameMalay}`}
        subtitle={`${surahData.nameArabic} • ${surahData.ayahs.length} ayat`}
        backHref="/quran"
      />

      <div className="mt-4 grid gap-3">
        {surahData.ayahs.map((a) => (
          <AyahCard key={a.number} ayah={a} />
        ))}
      </div>
    </div>
  );
}
