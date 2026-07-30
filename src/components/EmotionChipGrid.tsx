"use client";

import { MORE_CLAMP_KEY, useWrapClamp } from "./useWrapClamp";
import { GROUP_COLOR } from "@/lib/emotions";
import type { EmotionCount } from "@/lib/journal";
import type { Valence } from "@/lib/types";

const VALENCE_COLOR: Record<Valence, string> = {
  POSITIVA: GROUP_COLOR.positivas,
  NEGATIVA: GROUP_COLOR.negativas,
};

const CHIP_CLASS = "rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap";

/**
 * Fila de emociones para marcar en el filtro, limitada a 4 filas como mucho:
 * nunca hace scroll. Si no caben todas, la última posición de la cuarta fila
 * se convierte en un botón «Ver más» que despliega el resto.
 */
export function EmotionChipGrid({
  entries,
  activeKeys,
  onToggle,
}: {
  entries: EmotionCount[];
  activeKeys: string[];
  onToggle: (key: string, valence: Valence) => void;
}) {
  const { containerRef, measureRef, shown, expanded, needsToggle, toggleExpanded } = useWrapClamp(entries, 4);

  return (
    <div>
      {/* Medidor oculto: mismas clases que el chip real, para que el ancho
          medido coincida con el que ocupará en pantalla. Siempre en negrita,
          el peor caso, así marcar un chip como activo no le hace desbordar. */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none fixed top-[-9999px] left-[-9999px] whitespace-nowrap"
      >
        {entries.map((entry) => (
          <button key={entry.key} type="button" data-clamp-key={entry.key} className={CHIP_CLASS} tabIndex={-1}>
            {entry.label}
            <span className="ml-1 tabular-nums">{entry.count}</span>
          </button>
        ))}
        <button type="button" data-clamp-key={MORE_CLAMP_KEY} className={CHIP_CLASS} tabIndex={-1}>
          Ver más
        </button>
      </div>

      <div ref={containerRef} className="flex flex-wrap gap-1.5">
        {shown.map((entry) => {
          const active = activeKeys.includes(entry.key);
          return (
            <button
              key={entry.key}
              type="button"
              onClick={() => onToggle(entry.key, entry.valence)}
              aria-pressed={active}
              className={`${CHIP_CLASS} transition`}
              style={
                active
                  ? { backgroundColor: VALENCE_COLOR[entry.valence], borderColor: VALENCE_COLOR[entry.valence], color: "#08090c" }
                  : { borderColor: "var(--color-ink-700)", color: "var(--color-ink-300)", fontWeight: 500 }
              }
            >
              {entry.label}
              <span className="ml-1 opacity-60 tabular-nums">{entry.count}</span>
            </button>
          );
        })}

        {needsToggle ? (
          <button
            type="button"
            onClick={toggleExpanded}
            className={`${CHIP_CLASS} border-dashed border-ink-600 text-ink-300 transition hover:border-ink-400 hover:text-ink-100`}
          >
            {expanded ? "Ver menos" : "Ver más"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
