import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { getDoaItems } from "@/lib/data";

export default function DoaIndexPage() {
  const items = getDoaItems();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-5">
      <PageHeader title="Doa" subtitle="Koleksi doa untuk rujukan cepat." />
      <div className="mt-4 grid gap-3">
        {items.map((d) => (
          <Link key={d.id} href={`/doa/${d.id}`}>
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">{d.title}</div>
                  <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    {d.category}
                  </div>
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300">
                  Buka
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

