import type { Ayah } from "@/lib/types";
import { Card } from "@/components/ui/Card";

export function AyahCard({ ayah }: { ayah: Ayah }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Ayat {ayah.number}
        </div>
        <div className="rounded-full border border-gold-200 bg-gold-50 px-2 py-1 text-[11px] font-semibold text-amber-900 dark:border-gold-600/30 dark:bg-zinc-950/30 dark:text-gold-100">
          #{ayah.number}
        </div>
      </div>
      <div className="arabic-text mt-3 text-3xl leading-[1.9]">
        {ayah.arabic}
      </div>
      {ayah.roman ? (
        <div className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
          {ayah.roman}
        </div>
      ) : null}
      {ayah.ms ? (
        <div className="mt-3 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
          {ayah.ms}
        </div>
      ) : null}
    </Card>
  );
}

