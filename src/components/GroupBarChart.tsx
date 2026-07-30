"use client";

import { GROUP_COLOR } from "@/lib/emotions";
import type { EmotionCount } from "@/lib/journal";

const CHART_HEIGHT = 132;
const BAR_WIDTH = 56;

/**
 * Diagrama de barras de las emociones más presentes en el grupo. Si no caben,
 * la fila se desplaza lateralmente. Pulsar una barra marca o desmarca esa
 * emoción en el filtro.
 */
export function GroupBarChart({
  counts,
  activeKeys,
  onToggle,
}: {
  counts: EmotionCount[];
  activeKeys: string[];
  onToggle: (key: string) => void;
}) {
  if (counts.length === 0) return null;

  const max = counts.reduce((m, c) => Math.max(m, c.count), 1);

  return (
    <section className="rounded-2xl border border-ink-800 bg-ink-900/60 p-3">
      <h2 className="mb-3 text-xs font-medium tracking-wide text-ink-400 uppercase">Emociones más presentes</h2>

      <div className="thin-scrollbar -mx-1 flex items-end gap-2 overflow-x-auto px-1 pb-1">
        {counts.map((entry) => {
          const color = entry.valence === "POSITIVA" ? GROUP_COLOR.positivas : GROUP_COLOR.negativas;
          const active = activeKeys.includes(entry.key);
          const height = Math.max(6, Math.round((entry.count / max) * CHART_HEIGHT));

          return (
            <button
              key={entry.key}
              type="button"
              onClick={() => onToggle(entry.key)}
              aria-pressed={active}
              title={`${entry.label}: ${entry.count}`}
              className="flex shrink-0 flex-col items-center gap-1.5 rounded-lg px-1 pt-1 transition"
              style={{ width: BAR_WIDTH }}
            >
              <span className="text-[11px] font-semibold tabular-nums" style={{ color: active ? color : undefined }}>
                {entry.count}
              </span>
              <span
                className="w-full rounded-t-md transition-all"
                style={{
                  height,
                  backgroundColor: active ? color : `${color}59`,
                  boxShadow: active ? `0 0 0 1px ${color}` : undefined,
                }}
                aria-hidden
              />
              <span
                className={[
                  "line-clamp-2 h-7 w-full text-center text-[10px] leading-tight break-words",
                  active ? "font-semibold" : "",
                ].join(" ")}
                style={{ color: active ? color : "var(--color-ink-400)" }}
              >
                {entry.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
