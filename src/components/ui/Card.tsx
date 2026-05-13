export function Card({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-2xl border border-zinc-200 bg-white p-3 shadow-soft sm:p-4 dark:border-zinc-800 dark:bg-zinc-900/40",
        className ?? ""
      ].join(" ")}
    >
      {children}
    </div>
  );
}
