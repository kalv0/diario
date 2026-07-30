"use client";

import { useState } from "react";
import { useJournal } from "./JournalProvider";
import { Modal, ModalHeader } from "./Modal";
import { MonthCalendar, type DaySelection } from "./MonthCalendar";
import { calendarInitialMonth, filterLabel, PRESET_LABEL, type DatePreset } from "@/lib/date-filter";

const PRESETS: DatePreset[] = ["hoy", "7d", "30d"];

/**
 * Selector de rango de fechas de la cabecera. Es el único filtro global:
 * afecta a burbujas, recuentos, listado, línea de tiempo y páginas de grupo.
 */
export function DateFilterBar() {
  const { dateFilter, setDateFilter, earliest } = useJournal();
  const [open, setOpen] = useState(false);
  // Selección provisional del calendario: no se aplica hasta pulsar "Aplicar".
  const [selection, setSelection] = useState<DaySelection | null>(null);

  const isCustom = dateFilter.kind === "custom";

  function openPanel() {
    setSelection(dateFilter.kind === "custom" ? { from: dateFilter.from, to: dateFilter.to } : null);
    setOpen(true);
  }

  function applyPreset(preset: DatePreset) {
    // Volver a un preset borra la fecha personalizada: al reabrir el calendario
    // se vuelve a ver el mes actual con hoy remarcado.
    setSelection(null);
    setDateFilter({ kind: "preset", preset });
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openPanel}
        className="flex max-w-[70vw] items-center gap-2 rounded-full border border-ink-700 bg-ink-850/80 px-4 py-2 text-sm font-medium text-ink-100 backdrop-blur transition active:scale-[0.97]"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-ink-400" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
        </svg>
        <span className="truncate">{filterLabel(dateFilter)}</span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-ink-400" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} align="sheet" labelledBy="filtro-fechas" panelClassName="max-w-sm">
        <ModalHeader id="filtro-fechas" title="Rango de fechas" onClose={() => setOpen(false)} />

        <div className="px-5 py-4">
          <div className="mb-4 grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => {
              const active = dateFilter.kind === "preset" && dateFilter.preset === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className={[
                    "rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "border-ink-100 bg-ink-100 text-ink-950"
                      : "border-ink-700 bg-ink-850 text-ink-300 hover:border-ink-600",
                  ].join(" ")}
                >
                  {PRESET_LABEL[preset]}
                </button>
              );
            })}
          </div>

          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide text-ink-400 uppercase">Fecha personalizada</span>
            {isCustom ? (
              <span className="rounded-full bg-ink-800 px-2 py-0.5 text-[11px] text-ink-300">activa</span>
            ) : null}
          </div>

          <MonthCalendar
            initialMonth={calendarInitialMonth(dateFilter)}
            selection={selection}
            earliest={earliest}
            onSelectionChange={setSelection}
          />

          <p className="mt-3 text-center text-xs text-ink-400">
            Toca un día para elegirlo, y otro para cerrar un rango.
          </p>

          <button
            type="button"
            disabled={!selection}
            onClick={() => {
              if (!selection) return;
              setDateFilter({ kind: "custom", from: selection.from, to: selection.to });
              setOpen(false);
            }}
            className="mt-3 w-full rounded-2xl bg-ink-100 px-4 py-3 text-sm font-semibold text-ink-950 transition active:scale-[0.98] disabled:opacity-30"
          >
            Aplicar
          </button>
        </div>
      </Modal>
    </>
  );
}
