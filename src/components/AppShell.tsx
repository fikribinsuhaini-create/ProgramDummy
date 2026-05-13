import { BottomNav } from "@/components/BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <div className="pb-[calc(5rem+env(safe-area-inset-bottom))]">{children}</div>
      <BottomNav />
    </div>
  );
}
