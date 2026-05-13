"use client";

import { useEffect, useMemo, useState } from "react";
import type { ZikirItem } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { TargetBadge } from "@/components/zikir/TargetBadge";

export function ZikirCounter({
  zikir,
  allowCustomTarget,
  onComplete
}: {
  zikir: ZikirItem;
  allowCustomTarget?: boolean;
  onComplete?: () => void;
}) {
  const [count, setCount] = useState(0);
  const [targetOverride, setTargetOverride] = useState<number | undefined>(() => {
    const t = zikir.targetCount;
    return typeof t === "number" && t > 0 ? t : undefined;
  });
  const [completedOnce, setCompletedOnce] = useState(false);

  const target = allowCustomTarget ? targetOverride : zikir.targetCount;
  const pct = useMemo(() => {
    if (!target) return 0;
    return Math.min(100, Math.round((count / target) * 100));
  }, [count, target]);

  useEffect(() => {
    if (!onComplete) return;
    if (!target) return;
    if (completedOnce) return;
    if (count >= target) {
      setCompletedOnce(true);
      onComplete();
    }
  }, [count, target, completedOnce, onComplete]);

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Counter Zikir
          </div>
          <div className="mt-1 text-3xl font-semibold tabular-nums">
            {count}
          </div>
        </div>
        <TargetBadge target={target} />
      </div>

      {allowCustomTarget ? (
        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white/70 p-3 dark:border-zinc-800 dark:bg-zinc-950/20">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
              Target (custom)
            </div>
            <input
              inputMode="numeric"
              type="number"
              min={1}
              value={targetOverride ?? ""}
              placeholder="cth: 200"
              onChange={(e) => {
                const n = Number(e.target.value);
                setCompletedOnce(false);
                if (!Number.isFinite(n) || n <= 0) setTargetOverride(undefined);
                else setTargetOverride(Math.floor(n));
              }}
              className="w-32 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm tabular-nums text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-400 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
            />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[33, 100, 200].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setCompletedOnce(false);
                  setTargetOverride(n);
                }}
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 shadow-soft active:translate-y-[1px] dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
              >
                {n}x
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {target ? (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
            <span>Progress</span>
            <span className="tabular-nums">{pct}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-emerald-600 transition-[width] duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="arabic-text mt-5 text-4xl leading-[1.7]">
        {zikir.arabic}
      </div>
      {zikir.roman ? (
        <div className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
          {zikir.roman}
        </div>
      ) : null}
      {zikir.ms ? (
        <div className="mt-3 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
          {zikir.ms}
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-soft active:translate-y-[1px] active:opacity-95"
        >
          +1
        </button>
        <button
          type="button"
          onClick={() => {
            setCount(0);
            setCompletedOnce(false);
          }}
          className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-soft active:translate-y-[1px] active:opacity-95 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
        >
          Reset
        </button>
      </div>
    </Card>
  );
}
