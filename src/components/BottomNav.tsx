"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

const items: NavItem[] = [
  { href: "/solat", label: "Solat" },
  { href: "/quran", label: "Quran" },
  { href: "/doa", label: "Doa" },
  { href: "/zikir", label: "Zikir" },
  { href: "/sessions", label: "Session" }
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-2 py-2">
        {items.map((it) => {
          const active = isActive(pathname, it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={[
                "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs",
                active
                  ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              ].join(" ")}
            >
              <span className="font-medium">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
