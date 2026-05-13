import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { getZikirItems } from "@/lib/data";
import { TargetBadge } from "@/components/zikir/TargetBadge";

export default function ZikirIndexPage() {
  const items = getZikirItems();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-5">
      <PageHeader title="Zikir" subtitle="Koleksi zikir + counter ringkas." />
      <div className="mt-4 grid gap-3">
        {items.map((z) => (
          <Link key={z.id} href={`/zikir/${z.id}`}>
            <Card className="flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold">{z.title}</div>
                <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {z.ms}
                </div>
              </div>
              <TargetBadge target={z.targetCount} />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

