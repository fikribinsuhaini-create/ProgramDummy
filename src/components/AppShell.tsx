import { BottomNav } from "@/components/BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <div className="pb-20">{children}</div>
      <BottomNav />
    </div>
  );
}

