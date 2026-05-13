import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { getSurahs } from "@/lib/data";
import Link from "next/link";

export default function QuranIndexPage() {
  const surahs = getSurahs();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-5">
      <PageHeader
        title="Al-Quran"
        subtitle="Pilih surah untuk mula membaca."
      />

      <div className="mt-4">
        <Link href="/quran/reader">
          <Card className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-semibold">Baca (2 Mode)</div>
              <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                Ayat + terjemahan atau Muka surat (semua local).
              </div>
            </div>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Buka
            </div>
          </Card>
        </Link>
      </div>

      <div className="mt-4 grid gap-3">
        {surahs.map((s) => (
          <Link key={s.number} href={`/quran/${s.number}`}>
            <Card className="flex items-center justify-between">
              <div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  Surah {s.number}
                </div>
                <div className="text-base font-semibold">{s.nameMalay}</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  {s.ayahs.length} ayat
                </div>
              </div>
              <div className="arabic-text text-2xl text-emerald-700 dark:text-emerald-300">
                {s.nameArabic}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
