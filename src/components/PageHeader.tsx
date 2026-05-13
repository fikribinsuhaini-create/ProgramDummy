import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  backHref
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        {backHref ? (
          <Link
            href={backHref}
            className="text-xs text-emerald-700 hover:underline dark:text-emerald-300"
          >
            {"< Kembali"}
          </Link>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="hidden select-none rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200 sm:block">
        ProgramByUstazLah
      </div>
    </div>
  );
}
