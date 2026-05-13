import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/Card";
import { getDoaById } from "@/lib/data";

export default async function DoaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doa = getDoaById(id);
  if (!doa) return notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-5">
      <PageHeader title={doa.title} subtitle={doa.category} backHref="/doa" />
      <Card className="mt-4">
        <div className="arabic-text text-3xl leading-[1.8]">
          {doa.arabic}
        </div>
        {doa.roman ? (
          <div className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
            {doa.roman}
          </div>
        ) : null}
        {doa.ms ? (
          <div className="mt-3 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            {doa.ms}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
