import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { getSessions } from "@/lib/data";

export default function SessionsIndexPage() {
  const sessions = getSessions();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-5">
      <PageHeader title="Session" subtitle="Program amalan berpandukan susunan." />
      <div className="mt-4 grid gap-3">
        {sessions.map((s) => (
          <Link key={s.id} href={`/sessions/${s.id}`}>
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">{s.title}</div>
                  <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                    {s.description}
                  </div>
                  <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                    {s.items.length} langkah • {s.author}
                  </div>
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300">
                  Mula
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

