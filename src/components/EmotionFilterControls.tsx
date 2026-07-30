"use client";

import { useMemo } from "react";
import { EmotionChipGrid } from "./EmotionChipGrid";
import type { EmotionFilterState } from "./useEmotionFilter";
import { GROUP_COLOR } from "@/lib/emotions";
import { emotionCounts } from "@/lib/journal";
import type { Experience, Valence } from "@/lib/types";

const VALENCE_COLOR: Record<Valence, string> = {
  POSITIVA: GROUP_COLOR.positivas,
  NEGATIVA: GROUP_COLOR.negativas,
};

/**
 * Filtros por signo y por emoción concreta.
 *
 * El signo es de selección única y, cuando hay uno activo, la lista de
 * emociones concretas solo ofrece las de ese signo.
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
  const canPickValence = showValences && valencesPresent.size > 1;

  const visibleCounts = useMemo(
    () => (state.filter.valence ? counts.filter((c) => c.valence === state.filter.valence) : counts),
    [counts, state.filter.valence],
  );

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-ink-300">Filtra por emociones</h2>

      {state.active ? (
        <div>
          <button
            type="button"
            onClick={state.clear}
            className="flex items-center gap-1.5 rounded-full border border-ink-700 px-3 py-1.5 text-xs text-ink-300 transition hover:border-ink-500 hover:text-ink-100"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path
                d="M4 7h16M10 4h4a1 1 0 011 1v2H9V5a1 1 0 011-1zM6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M10 11v6M14 11v6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Limpiar filtro
          </button>
        </div>
      ) : null}

      {canPickValence || showSort ? (
        <div className="flex items-center gap-2">
          {canPickValence ? (
            <div className="flex gap-1.5">
              {(["POSITIVA", "NEGATIVA"] as Valence[]).map((valence) => {
                const active = state.filter.valence === valence;
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
      ) : null}

      {visibleCounts.length > 0 ? (
        <EmotionChipGrid entries={visibleCounts} activeKeys={state.activeKeys} onToggle={state.toggleEmotion} />
      ) : null}
    </section>
  );
}
