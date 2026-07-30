"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { GROUP_COLOR } from "@/lib/emotions";
import type { EmotionCount } from "@/lib/journal";
import type { Valence } from "@/lib/types";

const VALENCE_COLOR: Record<Valence, string> = {
  POSITIVA: GROUP_COLOR.positivas,
  NEGATIVA: GROUP_COLOR.negativas,
};

const MAX_ROWS = 4;

const CHIP_CLASS = "rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap";

/**
 * Fila de emociones para marcar en el filtro, limitada a 4 filas como mucho:
 * nunca hace scroll. Si no caben todas, la última posición de la cuarta fila
 * se convierte en un botón «Ver más» que despliega el resto.
 *
 * CSS por sí solo no puede limitar un `flex-wrap` a un número de filas
 * cuando el contenido tiene ancho variable, así que el empaquetado se
 * calcula en JS: se mide el ancho real de cada chip en un contenedor oculto
 * (mismas clases, así que el ancho medido coincide con el que ocupará el
 * chip visible) y se simula el mismo algoritmo greedy que usa `flex-wrap`
 * para repartirlos en filas.
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
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const verMasRef = useRef<HTMLButtonElement>(null);

  const [containerWidth, setContainerWidth] = useState(0);
  const [gap, setGap] = useState(6);
  const [chipWidths, setChipWidths] = useState<Map<string, number>>(new Map());
  const [verMasWidth, setVerMasWidth] = useState(0);

  const signature = entries.map((e) => `${e.key}:${e.label}:${e.count}`).join("|");

  // Medida inicial síncrona en useLayoutEffect: si se midiera después del
  // primer pintado se vería primero todo sin recortar y luego un salto al
  // aplicar el recorte.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setContainerWidth(el.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container) {
      const g = parseFloat(getComputedStyle(container).columnGap || "6");
      setGap(Number.isFinite(g) ? g : 6);
    }

    const nodes = measureRef.current?.querySelectorAll<HTMLButtonElement>("button[data-chip-key]") ?? [];
    const widths = new Map<string, number>();
    for (const node of nodes) {
      const key = node.dataset.chipKey;
      if (key) widths.set(key, node.getBoundingClientRect().width);
    }
    setChipWidths(widths);
    setVerMasWidth(verMasRef.current?.getBoundingClientRect().width ?? 0);
    setExpanded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const { visible, needsToggle } = useMemo(() => {
    if (containerWidth === 0 || chipWidths.size === 0) return { visible: entries, needsToggle: false };

    // Simula el mismo empaquetado greedy que hace flex-wrap: un elemento pasa
    // a la siguiente fila en cuanto no cabe en lo que queda de la actual.
    const rows: EmotionCount[][] = [];
    let row: EmotionCount[] = [];
    let rowWidth = 0;
    for (const entry of entries) {
      const width = chipWidths.get(entry.key) ?? 0;
      const needed = row.length === 0 ? width : rowWidth + gap + width;
      if (row.length === 0 || needed <= containerWidth) {
        row.push(entry);
        rowWidth = needed;
      } else {
        rows.push(row);
        row = [entry];
        rowWidth = width;
      }
    }
    if (row.length > 0) rows.push(row);

    if (rows.length <= MAX_ROWS) return { visible: entries, needsToggle: false };

    // Las tres primeras filas se quedan enteras; en la cuarta se hace hueco
    // para el botón «Ver más», quitando chips del final si hiciera falta.
    const firstRows = rows.slice(0, MAX_ROWS - 1);
    const firstCount = firstRows.reduce((sum, r) => sum + r.length, 0);
    const lastRow = rows[MAX_ROWS - 1];

    const widthWithK = (k: number): number => {
      if (k === 0) return verMasWidth;
      let width = gap + verMasWidth;
      for (let i = 0; i < k; i++) {
        width += (chipWidths.get(lastRow[i].key) ?? 0) + (i > 0 ? gap : 0);
      }
      return width;
    };

    let k = lastRow.length;
    while (k > 0 && widthWithK(k) > containerWidth) k -= 1;

    return { visible: entries.slice(0, firstCount + k), needsToggle: true };
  }, [entries, containerWidth, chipWidths, gap, verMasWidth]);

  const shown = expanded ? entries : visible;

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
          <button key={entry.key} type="button" data-chip-key={entry.key} className={CHIP_CLASS} tabIndex={-1}>
            {entry.label}
            <span className="ml-1 tabular-nums">{entry.count}</span>
          </button>
        ))}
        <button ref={verMasRef} type="button" className={CHIP_CLASS} tabIndex={-1}>
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
            onClick={() => setExpanded((e) => !e)}
            className={`${CHIP_CLASS} border-dashed border-ink-600 text-ink-300 transition hover:border-ink-400 hover:text-ink-100`}
          >
            {expanded ? "Ver menos" : "Ver más"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
