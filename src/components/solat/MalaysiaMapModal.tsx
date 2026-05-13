"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onPickState: (state: string) => void;
};

export function MalaysiaMapModal({ open, onClose, onPickState }: Props) {
  if (!open) return null;

  return <MalaysiaMapModalInner onClose={onClose} onPickState={onPickState} />;
}

function MalaysiaMapModalInner({
  onClose,
  onPickState
}: {
  onClose: () => void;
  onPickState: (state: string) => void;
}) {
  const [svgText, setSvgText] = useState<string | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/solat/map")
      .then((r) => r.text())
      .then((t) => {
        if (cancelled) return;
        setSvgText(t);
      })
      .catch(() => setSvgText(null));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const svg = host.querySelector("svg");
    if (!svg) return;

    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    // Event delegation (more reliable for tiny states like Labuan).
    const onClick = (e: Event) => {
      const target = e.target as Element | null;
      const el = target?.closest?.("path[name]") as SVGPathElement | null;
      const name = el?.getAttribute("name") ?? "";
      if (!name) return;
      onPickState(name);
      onClose();
    };

    const onOver = (e: Event) => {
      const target = e.target as Element | null;
      const el = target?.closest?.("path[name]") as SVGPathElement | null;
      if (!el) return;
      el.style.opacity = "0.85";
      el.style.cursor = "pointer";
    };

    const onOut = (e: Event) => {
      const target = e.target as Element | null;
      const el = target?.closest?.("path[name]") as SVGPathElement | null;
      if (!el) return;
      el.style.opacity = "1";
    };

    svg.addEventListener("click", onClick);
    svg.addEventListener("pointerover", onOver);
    svg.addEventListener("pointerout", onOut);

    return () => {
      svg.removeEventListener("click", onClick);
      svg.removeEventListener("pointerover", onOver);
      svg.removeEventListener("pointerout", onOut);
    };
  }, [svgText, onPickState, onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 backdrop-blur sm:items-center">
      <div className="w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white p-4 shadow-soft dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Pilih Negeri</div>
            <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Tap negeri → auto pilih zon pertama. Lepas tu refine zon guna dropdown.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-soft dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
          >
            Tutup
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-200 bg-cream-50 dark:border-zinc-800 dark:bg-zinc-900/30">
          <div className="max-h-[70vh] w-full overflow-auto p-2">
            <div
              ref={hostRef}
              className="mx-auto w-full [svg]:mx-auto [svg]:block [svg]:h-auto [svg]:min-w-[920px] [svg]:max-w-none"dangerouslySetInnerHTML={{
                __html: svgText ?? "<div class='p-4 text-sm'>Loading map...</div>"
              }}
            />
          </div>
        </div>

        <div className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
          Map source: `src/my.svg`.
        </div>
      </div>
    </div>
  );
}
