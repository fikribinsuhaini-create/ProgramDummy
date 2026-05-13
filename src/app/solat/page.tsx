import { PageHeader } from "@/components/PageHeader";
import { SolatDashboard } from "@/components/solat/SolatDashboard";

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

