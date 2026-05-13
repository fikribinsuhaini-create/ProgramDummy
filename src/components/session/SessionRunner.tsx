"use client";

import { useMemo, useState } from "react";
import type { Session, SessionItem } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/PageHeader";
import { getDoaByIdClient, getQuranRangeClient, getZikirByIdClient } from "@/lib/data-client";
import { AyahCard } from "@/components/quran/AyahCard";
import { ZikirCounter } from "@/components/zikir/ZikirCounter";
import { useRouter } from "next/navigation";
import { RemoteQuranReader } from "@/components/quran/RemoteQuranReader";
import { LocalQuranReader } from "@/components/quran/LocalQuranReader";

function StepPill({ text }: { text: string }) {
  return (
    <div className="rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-xs font-semibold text-zinc-700 shadow-soft backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200">
      {text}
    </div>
  );
}

export function SessionRunner({ session }: { session: Session }) {
  const [index, setIndex] = useState(0);
  const total = session.items.length;
  const item = session.items[index] as SessionItem | undefined;
  const router = useRouter();
  const [completeModalOpen, setCompleteModalOpen] = useState(false);

  const progressText = `Langkah ${index + 1} daripada ${total}`;

  const content = useMemo(() => {
    if (!item) return null;

    if (item.type === "quran") {
      const range = getQuranRangeClient(item.surah, item.fromAyah, item.toAyah);
      return (
        <div className="grid gap-3">
          {range.map((a) => (
            <AyahCard key={a.number} ayah={a} />
          ))}
        </div>
      );
    }

    if (item.type === "quran_group") {
      return (
        <div className="grid gap-6">
          {item.parts.map((p, idx) => {
            const range = getQuranRangeClient(p.surah, p.fromAyah, p.toAyah);
            return (
              <div key={`${p.surah}:${p.fromAyah}-${p.toAyah}`}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                    {p.title ?? `Surah ${p.surah} (${p.fromAyah}-${p.toAyah})`}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    Bahagian {idx + 1}/{item.parts.length}
                  </div>
                </div>
                <div className="grid gap-3">
                  {range.map((a) => (
                    <AyahCard key={`${p.surah}:${a.number}`} ayah={a} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (item.type === "quran_remote") {
      if (item.mode === "juz" && typeof item.juzNumber === "number") {
        return (
          <RemoteQuranReader
            mode="juz"
            juzNumber={item.juzNumber}
            scopeKey={`session:${session.id}`}
            title={item.title}
            allowSurahPicker
          />
        );
      }
      if (
        item.mode === "chapter_range" &&
        typeof item.surah === "number" &&
        typeof item.fromAyah === "number" &&
        typeof item.toAyah === "number"
      ) {
        return (
          <RemoteQuranReader
            mode="chapter_range"
            surah={item.surah}
            fromAyah={item.fromAyah}
            toAyah={item.toAyah}
            scopeKey={`session:${session.id}:surah:${item.surah}:${item.fromAyah}-${item.toAyah}`}
            title={item.title}
          />
        );
      }
      return (
        <Card>
          <div className="text-sm text-zinc-700 dark:text-zinc-300">
            Item Quran remote tak lengkap.
          </div>
        </Card>
      );
    }

    if (item.type === "quran_local_reader") {
      return (
        <LocalQuranReader
          initialSourceMode={item.initialSourceMode ?? "juz"}
          initialJuz={item.initialJuz ?? 1}
          initialSurah={item.initialSurah ?? 1}
        />
      );
    }

    if (item.type === "doa") {
      const doa = getDoaByIdClient(item.ref);
      if (!doa) {
        return (
          <Card>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              Doa tidak dijumpai: <span className="font-mono">{item.ref}</span>
            </div>
          </Card>
        );
      }
      return (
        <Card>
          <div className="arabic-text text-3xl leading-[1.8]">{doa.arabic}</div>
          {doa.roman ? (
            <div className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
              {doa.roman}
            </div>
          ) : null}
          {doa.ms ? (
            <div className="mt-3 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
              {doa.ms}
            </div>
          ) : null}
        </Card>
      );
    }

    if (item.type === "zikir") {
      const zikir = getZikirByIdClient(item.ref);
      if (!zikir) {
        return (
          <Card>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              Zikir tidak dijumpai: <span className="font-mono">{item.ref}</span>
            </div>
          </Card>
        );
      }
      const shouldShowCounter = item.ref === "selawat" || typeof item.targetCount === "number";
      const merged = {
        ...zikir,
        targetCount: item.targetCount ?? zikir.targetCount
      };

      if (!shouldShowCounter) {
        return (
          <Card>
            <div className="arabic-text text-3xl leading-[1.8]">{merged.arabic}</div>
            {merged.roman ? (
              <div className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
                {merged.roman}
              </div>
            ) : null}
            {merged.ms ? (
              <div className="mt-3 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                {merged.ms}
              </div>
            ) : null}
          </Card>
        );
      }

      return (
        <ZikirCounter
          zikir={merged}
          allowCustomTarget
          onComplete={() => setCompleteModalOpen(true)}
        />
      );
    }

    return null;
  }, [item, session.id]);

  if (!item) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <PageHeader title={session.title} backHref="/sessions" />
        <Card className="mt-4">Tiada item untuk session ini.</Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {completeModalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 backdrop-blur sm:items-center">
          <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-5 shadow-soft dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-lg font-semibold">Target cukup</div>
            <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
              Alhamdulillah. Teruskan istiqamah.
            </div>
            <div className="arabic-text mt-4 rounded-2xl bg-cream-100 px-4 py-3 text-2xl leading-[1.8] text-zinc-900 dark:bg-zinc-900/40 dark:text-zinc-100">
              أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCompleteModalOpen(false)}
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-soft dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => router.push("/sessions")}
                className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-soft"
              >
                Tamat Session
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="sticky top-0 z-40 -mx-4 bg-cream-50/85 px-4 pb-3 pt-2 backdrop-blur dark:bg-zinc-950/70">
        <PageHeader
          title={session.title}
          subtitle={session.description}
          backHref="/sessions"
        />
        <div className="mt-3 flex items-center justify-between gap-2">
          <StepPill text={progressText} />
          <StepPill text={item.title ?? "Session Item"} />
        </div>
      </div>

      <div className="mt-4">{content}</div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-soft disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
        >
          Sebelumnya
        </button>
        <button
          type="button"
          onClick={() => setIndex(0)}
          className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-soft dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-100"
        >
          Ulang
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          disabled={index === total - 1}
          className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-soft disabled:opacity-50"
        >
          Seterusnya
        </button>
      </div>

      <button
        type="button"
        onClick={() => router.push("/sessions")}
        className="mt-3 w-full rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white shadow-soft dark:bg-zinc-100 dark:text-zinc-900"
      >
        Tamat Session
      </button>
    </div>
  );
}
