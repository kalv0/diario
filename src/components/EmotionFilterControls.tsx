"use client";

import { useMemo } from "react";
import type { EmotionFilterState } from "./useEmotionFilter";
import { GROUP_COLOR } from "@/lib/emotions";
import { emotionCounts } from "@/lib/journal";
import type { Experience, Valence } from "@/lib/types";

const VALENCE_COLOR: Record<Valence, string> = {
  POSITIVA: GROUP_COLOR.positivas,
  NEGATIVA: GROUP_COLOR.negativas,
};

/**
 * Filtros por signo y por emoción concreta. Las emociones que se ofrecen salen
 * de las experiencias que hay en pantalla, ordenadas por frecuencia.
 */
export function EmotionFilterControls({
  source,
  state,
  showValences = true,
  showSort = true,
}: {
  source: Experience[];
  state: EmotionFilterState;
  showValences?: boolean;
  showSort?: boolean;
}) {
  const counts = useMemo(() => emotionCounts(source), [source]);
  const valencesPresent = useMemo(() => new Set(counts.map((c) => c.valence)), [counts]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {showValences && valencesPresent.size > 1 ? (
          <div className="flex gap-1.5">
            {(["POSITIVA", "NEGATIVA"] as Valence[]).map((valence) => {
              const active = state.filter.valences.includes(valence);
              const color = VALENCE_COLOR[valence];
              return (
                <button
                  key={valence}
                  type="button"
                  onClick={() => state.toggleValence(valence)}
                  aria-pressed={active}
                  className="rounded-full border px-3 py-1.5 text-xs font-medium transition"
                  style={
                    active
                      ? { backgroundColor: color, borderColor: color, color: "#08090c" }
                      : { borderColor: `${color}66`, color }
                  }
                >
                  {valence === "POSITIVA" ? "Positivas" : "Negativas"}
                </button>
              );
            })}
          </div>
        ) : null}

        {showSort ? (
          <label className="ml-auto flex items-center gap-1.5 text-xs text-ink-400">
            <span className="sr-only sm:not-sr-only">Orden</span>
            <select
              value={state.sort}
              onChange={(event) => state.setSort(event.target.value as "recientes" | "intensidad")}
              className="rounded-full border border-ink-700 bg-ink-850 px-3 py-1.5 text-xs text-ink-100 outline-none focus:border-ink-400"
            >
              <option value="recientes">Más recientes</option>
              <option value="intensidad">Mayor intensidad</option>
            </select>
          </label>
        ) : null}
      </div>

      {counts.length > 0 ? (
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5">
          {state.active ? (
            <button
              type="button"
              onClick={state.clear}
              className="shrink-0 rounded-full border border-ink-600 bg-ink-800 px-3 py-1.5 text-xs font-medium text-ink-100"
            >
              Limpiar
            </button>
          ) : null}
          {counts.map((entry) => {
            const active = state.filter.emotions.includes(entry.key);
            const color = VALENCE_COLOR[entry.valence];
            return (
              <button
                key={entry.key}
                type="button"
                onClick={() => state.toggleEmotion(entry.key)}
                aria-pressed={active}
                className="shrink-0 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap transition"
                style={
                  active
                    ? { backgroundColor: color, borderColor: color, color: "#08090c", fontWeight: 600 }
                    : { borderColor: "var(--color-ink-700)", color: "var(--color-ink-300)" }
                }
              >
                {entry.label}
                <span className="ml-1 opacity-60 tabular-nums">{entry.count}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
