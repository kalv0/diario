"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { formatShort } from "@/lib/date-filter";
import { GROUP_COLOR } from "@/lib/emotions";
import type { TimelineDay } from "@/lib/journal";

const ZOOM_STEPS = 8;

/**
 * Diagrama tipo cotización: cada día es una columna de cuadrados verdes hacia
 * arriba (entradas con emoción positiva) y rojos hacia abajo (con emoción
 * negativa). Una entrada ambigua suma en los dos lados.
 *
 * El zoom cambia el ancho de día. Como los cuadrados son cuadrados, la altura
 * de una columna es (nº de entradas × ancho de día), así que el ancho
 * máximo sale de no rebasar nunca la altura reservada al diagrama:
 *
 *     anchoMáx = (altoDiagrama / 2) / díaConMásEntradas
 *
 * El zoom mínimo es el que hace que la línea ocupe todo el ancho disponible,
 * salvo que ese ancho supere el máximo anterior: en ese caso ambos coinciden y
 * la línea se queda corta, que es justo lo que debe pasar cuando hay pocos días
 * con mucha carga.
 */
export function Timeline({ days }: { days: TimelineDay[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(720);
  const [zoom, setZoom] = useState(0);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setContainerWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const update = () => setViewportHeight(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const chartHeight = Math.max(120, Math.min(260, Math.round(viewportHeight / 3)));
  const half = chartHeight / 2;

  const maxCount = useMemo(
    () => days.reduce((max, day) => Math.max(max, day.positive, day.negative), 1),
    [days],
  );

  const { dayWidth, minDayWidth, maxDayWidth } = useMemo(() => {
    const maxW = Math.max(2, Math.min(half / maxCount, 44));
    const fitW = days.length > 0 && containerWidth > 0 ? containerWidth / days.length : maxW;
    const minW = Math.max(1.5, Math.min(fitW, maxW));
    const width = minW + (maxW - minW) * (zoom / ZOOM_STEPS);
    return { dayWidth: width, minDayWidth: minW, maxDayWidth: maxW };
  }, [half, maxCount, days.length, containerWidth, zoom]);

  const gap = Math.min(2, dayWidth * 0.18);
  const cell = Math.max(1, dayWidth - gap);
  const totalWidth = days.length * dayWidth;
  const canZoomIn = zoom < ZOOM_STEPS && maxDayWidth - minDayWidth > 0.5;
  const canZoomOut = zoom > 0;
  const showDayLabels = dayWidth >= 20;

  // Al aumentar el zoom se mira el final del rango (lo más reciente).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [zoom, days.length]);

  const totalPositive = days.reduce((sum, d) => sum + d.positive, 0);
  const totalNegative = days.reduce((sum, d) => sum + d.negative, 0);

  return (
    <section className="rounded-2xl border border-ink-800 bg-ink-900/60 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-[11px] text-ink-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: GROUP_COLOR.positivas }} aria-hidden />
            {totalPositive} con emoción positiva
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: GROUP_COLOR.negativas }} aria-hidden />
            {totalNegative} con emoción negativa
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Alejar"
            disabled={!canZoomOut}
            onClick={() => setZoom((z) => Math.max(0, z - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-700 text-ink-300 transition enabled:hover:bg-ink-800 disabled:opacity-25"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Acercar"
            disabled={!canZoomIn}
            onClick={() => setZoom((z) => Math.min(ZOOM_STEPS, z + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink-700 text-ink-300 transition enabled:hover:bg-ink-800 disabled:opacity-25"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="no-scrollbar overflow-x-auto overflow-y-hidden">
        <div className="relative" style={{ width: Math.max(totalWidth, containerWidth || 0), height: chartHeight }}>
          <div
            className="pointer-events-none absolute right-0 left-0 h-px bg-ink-700"
            style={{ top: half }}
            aria-hidden
          />

          {days.map((day, index) => {
            const left = index * dayWidth;
            return (
              <div key={day.key} className="absolute top-0" style={{ left, width: dayWidth, height: chartHeight }}>
                {Array.from({ length: day.positive }).map((_, k) => (
                  <span
                    key={`p-${k}`}
                    className="absolute rounded-[1px]"
                    style={{
                      bottom: half + k * dayWidth + gap / 2,
                      left: gap / 2,
                      width: cell,
                      height: cell,
                      backgroundColor: GROUP_COLOR.positivas,
                      opacity: 0.55 + Math.min(0.45, k * 0.06),
                    }}
                  />
                ))}
                {Array.from({ length: day.negative }).map((_, k) => (
                  <span
                    key={`n-${k}`}
                    className="absolute rounded-[1px]"
                    style={{
                      top: half + k * dayWidth + gap / 2,
                      left: gap / 2,
                      width: cell,
                      height: cell,
                      backgroundColor: GROUP_COLOR.negativas,
                      opacity: 0.55 + Math.min(0.45, k * 0.06),
                    }}
                  />
                ))}
                {showDayLabels ? (
                  <span
                    className="absolute text-center text-[9px] text-ink-600 tabular-nums"
                    style={{ top: half + 4, left: 0, width: dayWidth }}
                  >
                    {day.date.getDate()}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {days.length > 0 ? (
        <div className="mt-1.5 flex justify-between text-[11px] text-ink-400">
          <span>{formatShort(days[0].date)}</span>
          <span>{formatShort(days[days.length - 1].date)}</span>
        </div>
      ) : null}
    </section>
  );
}
