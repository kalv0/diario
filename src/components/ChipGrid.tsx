"use client";

import { MORE_CLAMP_KEY, useWrapClamp } from "./useWrapClamp";

export interface ChipItem {
  key: string;
  label: string;
  /** Recuento opcional, para las listas de filtro. */
  count?: number;
  /** Color del chip cuando está marcado. */
  color: string;
}

const CHIP_CLASS = "rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap";

/**
 * Rejilla de chips limitada a 4 filas: nunca hace scroll. Si no caben todos,
 * la última posición se convierte en un botón «Ver más» que despliega el resto.
 *
 * La usan el filtro de emociones y los de área e involucrados. El recorte real
 * vive en `useWrapClamp`; aquí solo se pinta.
 */
export function ChipGrid({
  items,
  activeKeys,
  onToggle,
  maxRows = 4,
}: {
  items: ChipItem[];
  activeKeys: string[];
  onToggle: (key: string) => void;
  maxRows?: number;
}) {
  const { containerRef, measureRef, shown, expanded, needsToggle, toggleExpanded } = useWrapClamp(items, maxRows);

  return (
    <div>
      {/* Medidor oculto: mismas clases que el chip real, para que el ancho
          medido coincida con el que ocupará en pantalla. Siempre en negrita,
          el peor caso, así marcar un chip no le hace desbordar. */}
      <div
        ref={measureRef}
        aria-hidden
        className="pointer-events-none fixed top-[-9999px] left-[-9999px] whitespace-nowrap"
      >
        {items.map((item) => (
          <button key={item.key} type="button" data-clamp-key={item.key} className={CHIP_CLASS} tabIndex={-1}>
            {item.label}
            {item.count !== undefined ? <span className="ml-1 tabular-nums">{item.count}</span> : null}
          </button>
        ))}
        <button type="button" data-clamp-key={MORE_CLAMP_KEY} className={CHIP_CLASS} tabIndex={-1}>
          Ver más
        </button>
      </div>

      <div ref={containerRef} className="flex flex-wrap gap-1.5">
        {shown.map((item) => {
          const active = activeKeys.includes(item.key);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onToggle(item.key)}
              aria-pressed={active}
              className={`${CHIP_CLASS} transition`}
              style={
                active
                  ? { backgroundColor: item.color, borderColor: item.color, color: "#08090c" }
                  : { borderColor: "var(--color-ink-700)", color: "var(--color-ink-300)", fontWeight: 500 }
              }
            >
              {item.label}
              {item.count !== undefined ? <span className="ml-1 opacity-60 tabular-nums">{item.count}</span> : null}
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
