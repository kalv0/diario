"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BubbleField } from "./BubbleField";
import { useHref, useJournal } from "./JournalProvider";
import { GROUP_COLOR } from "@/lib/emotions";
import { bubblesFor, entriesLabel, groupExperiences } from "@/lib/journal";
import type { GroupType } from "@/lib/types";

/** Orden vertical fijo: positivas arriba, ambiguas en medio, negativas abajo. */
const ORDER: GroupType[] = ["positivas", "ambiguas", "negativas"];

/**
 * Vista principal. La pantalla se reparte entre los grupos que tienen datos en
 * el rango de fechas activo: uno ocupa todo el alto, dos la mitad cada uno y
 * tres un tercio cada uno.
 */
export function BubblesView() {
  const { experiences } = useJournal();
  const href = useHref();

  const grouped = useMemo(() => groupExperiences(experiences), [experiences]);
  const visible = ORDER.filter((group) => grouped[group].length > 0);

  const bubbles = useMemo(
    () => Object.fromEntries(ORDER.map((group) => [group, bubblesFor(group, grouped[group])])) as Record<
      GroupType,
      ReturnType<typeof bubblesFor>
    >,
    [grouped],
  );

  if (visible.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="mb-4 flex gap-1.5 opacity-30" aria-hidden>
          <span className="h-8 w-8 rounded-full border border-pos" />
          <span className="h-6 w-6 self-center rounded-full border border-mix" />
          <span className="h-7 w-7 self-end rounded-full border border-neg" />
        </div>
        <p className="text-base font-medium text-ink-300">No hay entradas en este rango</p>
        <p className="mt-1 max-w-xs text-sm text-ink-400">
          Cambia el filtro de fechas de arriba o añade una entrada nueva con el botón +.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {visible.map((group, index) => {
        const count = grouped[group].length;
        const color = GROUP_COLOR[group];
        return (
          <Link
            key={group}
            href={href(`/grupo/${group}`)}
            aria-label={`Ver ${count} ${entriesLabel(group, count)}`}
            className={[
              "relative block flex-1 overflow-hidden transition-colors active:bg-white/[0.03]",
              index > 0 ? "border-t border-ink-800/70" : "",
            ].join(" ")}
            style={{ background: `linear-gradient(180deg, ${color}0d 0%, transparent 55%)` }}
          >
            <BubbleField bubbles={bubbles[group]} color={color} />

            <div className="pointer-events-none absolute top-3 left-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden />
              <span className="text-xs font-medium tracking-wide text-ink-300">
                <span className="font-semibold text-ink-100">{count}</span> {entriesLabel(group, count)}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
