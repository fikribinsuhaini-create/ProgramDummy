import { notFound } from "next/navigation";
import { getSessionById } from "@/lib/data";
import { SessionRunner } from "@/components/session/SessionRunner";

export default async function SessionRunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = getSessionById(id);
  if (!session) return notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-4">
      <SessionRunner session={session} />
    </div>
  );
}
