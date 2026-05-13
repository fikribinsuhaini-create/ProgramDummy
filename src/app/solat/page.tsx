import { PageHeader } from "@/components/PageHeader";
import dynamic from "next/dynamic";

const SolatDashboard = dynamic(
  () => import("@/components/solat/SolatDashboard").then((m) => m.SolatDashboard),
  { ssr: false }
);

export default function SolatPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-24 pt-5">
      <PageHeader
        title="Waktu Solat"
        subtitle="JAKIM e-Solat (zon). Default: Selangor."
      />
      <div className="mt-4">
        <SolatDashboard />
      </div>
    </div>
  );
}
