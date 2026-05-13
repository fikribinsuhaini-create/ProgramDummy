import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { getSurahByNumber } from "@/lib/data";
import { AyahCard } from "@/components/quran/AyahCard";

export default function SurahPage({
  params
}: {
  params: { surah: string };
}) {
  const number = Number(params.surah);
  if (!Number.isFinite(number)) return notFound();

  const surah = getSurahByNumber(number);
  if (!surah) return notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-5">
      <PageHeader
        title={`Surah ${surah.nameMalay}`}
        subtitle={`${surah.nameArabic} • ${surah.ayahs.length} ayat`}
        backHref="/quran"
      />

      <div className="mt-4 grid gap-3">
        {surah.ayahs.map((a) => (
          <AyahCard key={a.number} ayah={a} />
        ))}
      </div>
    </div>
  );
}

