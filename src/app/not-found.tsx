import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-8">
      <Card>
        <div className="text-lg font-semibold">Halaman tidak dijumpai</div>
        <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
          Sila kembali ke modul utama.
        </div>
        <div className="mt-4 flex gap-2">
          <Link
            href="/quran"
            className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-soft"
          >
            Pergi ke Quran
          </Link>
          <Link
            href="/sessions"
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-soft dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
          >
            Pergi ke Session
          </Link>
        </div>
      </Card>
    </div>
  );
}

