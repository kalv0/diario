"use client";

import { useMemo, useState } from "react";
import { addMonths, dayKey, formatMonthYear, isBeforeMonth, parseDayKey, startOfMonth } from "@/lib/date-filter";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

export interface DaySelection {
  from: string;
  to: string;
}

/**
 * Calendario de un mes con selección de día suelto o rango.
 *
 * - Se abre en el mes que le indique `initialMonth` (mes actual si no hay
 *   filtro; el mes del día elegido o el del final del rango si lo hay).
 * - Solo se puede navegar entre el mes del primer registro y el mes actual:
 *   nunca a meses futuros.
 * - Primer toque fija el día; segundo toque cierra el rango.
 */
export function MonthCalendar({
  initialMonth,
  selection,
  earliest,
  onSelectionChange,
}: {
  initialMonth: Date;
  selection: DaySelection | null;
  earliest: Date | null;
  onSelectionChange: (selection: DaySelection) => void;
}) {
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState<Date>(() => startOfMonth(initialMonth));
  /** true cuando el rango está cerrado y el próximo toque empieza otro nuevo. */
  const [closed, setClosed] = useState(true);

  const todayKey = dayKey(today);
  const currentMonth = startOfMonth(today);
  const minMonth = startOfMonth(earliest ?? today);

  const canGoBack = isBeforeMonth(minMonth, month);
  const canGoForward = isBeforeMonth(month, currentMonth);

  const cells = useMemo(() => {
    const first = startOfMonth(month);
    // getDay(): 0 = domingo. Queremos que la semana empiece en lunes.
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const result: (Date | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      result.push(new Date(month.getFullYear(), month.getMonth(), d));
    }
    return result;
  }, [month]);

  function handlePick(date: Date) {
    const key = dayKey(date);
    if (closed || !selection) {
      onSelectionChange({ from: key, to: key });
      setClosed(false);
      return;
    }
    if (key < selection.from) onSelectionChange({ from: key, to: selection.to });
    else onSelectionChange({ from: selection.from, to: key });
    setClosed(true);
  }

  return (
    <div className="select-none">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Mes anterior"
          disabled={!canGoBack}
          onClick={() => setMonth((m) => addMonths(m, -1))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-300 transition enabled:hover:bg-ink-800 disabled:opacity-25"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-sm font-semibold">{formatMonthYear(month)}</span>
        <button
          type="button"
          aria-label="Mes siguiente"
          disabled={!canGoForward}
          onClick={() => setMonth((m) => addMonths(m, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-300 transition enabled:hover:bg-ink-800 disabled:opacity-25"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[11px] font-medium text-ink-400">
        {WEEKDAYS.map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((date, index) => {
          if (!date) return <span key={`empty-${index}`} />;

          const key = dayKey(date);
          const isFuture = key > todayKey;
          const isToday = key === todayKey;
          const inRange = !!selection && key >= selection.from && key <= selection.to;
          const isEdge = !!selection && (key === selection.from || key === selection.to);

          return (
            <button
              key={key}
              type="button"
              disabled={isFuture}
              onClick={() => handlePick(date)}
              className={[
                "relative flex h-10 items-center justify-center rounded-lg text-sm transition",
                isFuture ? "cursor-not-allowed text-ink-700" : "text-ink-100",
                inRange && !isEdge ? "bg-ink-700/70" : "",
                isEdge ? "bg-ink-100 font-semibold text-ink-950" : "",
                !inRange && !isFuture ? "hover:bg-ink-800" : "",
              ].join(" ")}
            >
              {date.getDate()}
              {isToday && !isEdge ? (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-ink-300" aria-hidden />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function selectionFromFilter(from: string, to: string): DaySelection {
  return { from, to };
}

export function rangeLabel(selection: DaySelection): string {
  const from = parseDayKey(selection.from);
  const to = parseDayKey(selection.to);
  const fmt = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" });
  return selection.from === selection.to ? fmt.format(from) : `${fmt.format(from)} – ${fmt.format(to)}`;
}
