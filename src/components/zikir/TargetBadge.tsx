export function TargetBadge({ target }: { target?: number }) {
  if (!target) return null;
  return (
    <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
      {target}x
    </div>
  );
}

