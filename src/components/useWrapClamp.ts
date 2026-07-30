"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { clampToRows, type RowClampItem } from "@/lib/row-clamp";

/** Clave reservada para el chip «Ver más» dentro del medidor oculto. */
export const MORE_CLAMP_KEY = "__ver-mas__";

/**
 * Recorta una lista de chips a un máximo de filas, sin scroll: si no caben
 * todos, la última posición se convierte en un botón «Ver más» que despliega
 * el resto (y «Ver menos» para recogerlos).
 *
 * El consumidor renderiza dos cosas:
 * 1. Un contenedor oculto con `ref={measureRef}`, con un elemento por cada
 *    item (`data-clamp-key={item.key}`, mismas clases que el chip real para
 *    que el ancho medido coincida) más uno con `data-clamp-key={MORE_CLAMP_KEY}`
 *    para el botón «Ver más».
 * 2. El contenedor visible con `ref={containerRef}` y `flex flex-wrap`,
 *    pintando `shown` (en vez de la lista completa) y el botón de alternar
 *    cuando `needsToggle` es true.
 */
export function useWrapClamp<T extends RowClampItem>(items: T[], maxRows = 4) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [gap, setGap] = useState(6);
  const [widths, setWidths] = useState<Map<string, number>>(new Map());

  const signature = items.map((item) => item.key).join("|");

  // Medida inicial síncrona: si se midiera después del primer pintado se
  // vería primero todo sin recortar y luego un salto al aplicar el recorte.
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

    if (process.env.NODE_ENV !== "production" && !measureRef.current) {
      // Fallo silencioso conocido: sin este ref, `widths` se queda vacío y el
      // recorte nunca se activa (siempre "cabe todo"). Ver CLAUDE.md.
      console.warn("useWrapClamp: falta ref={measureRef} en el contenedor oculto de medida.");
    }

    const nodes = measureRef.current?.querySelectorAll<HTMLElement>("[data-clamp-key]") ?? [];
    const next = new Map<string, number>();
    for (const node of nodes) {
      const key = node.dataset.clampKey;
      if (key) next.set(key, node.getBoundingClientRect().width);
    }
    setWidths(next);
    setExpanded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const moreWidth = widths.get(MORE_CLAMP_KEY) ?? 0;

  const { visible, needsToggle } = useMemo(
    () => clampToRows(items, widths, containerWidth, gap, moreWidth, maxRows),
    [items, widths, containerWidth, gap, moreWidth, maxRows],
  );

  return {
    containerRef,
    measureRef,
    shown: expanded ? items : visible,
    expanded,
    needsToggle,
    toggleExpanded: () => setExpanded((e) => !e),
  };
}
