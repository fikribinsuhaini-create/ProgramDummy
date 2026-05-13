import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { getZikirById } from "@/lib/data";
import { ZikirCounter } from "@/components/zikir/ZikirCounter";

export default function ZikirDetailPage({
  params
}: {
  params: { id: string };
}) {
  const zikir = getZikirById(params.id);
  if (!zikir) return notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-5">
      <PageHeader title={zikir.title} backHref="/zikir" />
      <div className="mt-4">
        <ZikirCounter zikir={zikir} />
      </div>
    </div>
  );
}

