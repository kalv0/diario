"use client";

import { useMemo, useState } from "react";
import { ChipGrid } from "./ChipGrid";
import { EmotionChipGrid } from "./EmotionChipGrid";
import { Modal, ModalHeader } from "./Modal";
import type { EntryFilterState } from "./useEntryFilter";
import { GROUP_COLOR } from "@/lib/emotions";
import { emotionCounts, type SortMode } from "@/lib/journal";
import { ORIGIN_ICON, ORIGIN_LABEL, ORIGINS } from "@/lib/origin";
import { TAG_COLOR, TAG_LABEL, tagCounts } from "@/lib/tags";
import type { Experience, Valence } from "@/lib/types";

const VALENCE_COLOR: Record<Valence, string> = {
  POSITIVA: GROUP_COLOR.positivas,
  NEGATIVA: GROUP_COLOR.negativas,
};

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "recientes", label: "Más recientes" },
  { value: "intensidad", label: "Mayor intensidad" },
];

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-ink-400" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TriggerPill({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-medium transition active:scale-[0.97]",
        active ? "border-ink-500 bg-ink-800 text-ink-100" : "border-ink-700 bg-ink-850 text-ink-300",
      ].join(" ")}
    >
      {children}
      <ChevronIcon />
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 text-xs font-medium tracking-wide text-ink-400 uppercase">{children}</h3>;
}

/**
 * Filtros de entrada (origen, signo y emociones concretas) y orden del
 * listado, cada uno en su desplegable.
 */
export function EntryFilterControls({
  source,
  state,
  showValences = true,
  showSort = true,
}: {
  source: Experience[];
  state: EntryFilterState;
  showValences?: boolean;
  showSort?: boolean;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const counts = useMemo(() => emotionCounts(source), [source]);
  const areaItems = useMemo(
    () => tagCounts(source, "AREA").map((t) => ({ ...t, color: TAG_COLOR.AREA })),
    [source],
  );
  const involvedItems = useMemo(
    () => tagCounts(source, "INVOLUCRADO").map((t) => ({ ...t, color: TAG_COLOR.INVOLUCRADO })),
    [source],
  );
  const valencesPresent = useMemo(() => new Set(counts.map((c) => c.valence)), [counts]);
  const canPickValence = showValences && valencesPresent.size > 1;

  const visibleCounts = useMemo(
    () => (state.filter.valence ? counts.filter((c) => c.valence === state.filter.valence) : counts),
    [counts, state.filter.valence],
  );

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === state.sort)?.label ?? "";

  return (
    <div className="flex items-center gap-2">
      <TriggerPill onClick={() => setFilterOpen(true)} active={state.active}>
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 5h16l-6 7.5V18l-4 2v-7.5L4 5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Filtros
      </TriggerPill>

      <Modal open={filterOpen} onClose={() => setFilterOpen(false)} labelledBy="filtros" panelClassName="max-w-sm">
        <ModalHeader
          id="filtros"
          title="Filtros"
          onClose={() => setFilterOpen(false)}
          right={
            state.active ? (
              <button
                type="button"
                onClick={state.clear}
                aria-label="Limpiar filtro"
                title="Limpiar filtro"
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink-400 transition hover:bg-ink-800 hover:text-ink-100"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path
                    d="M4 7h16M10 4h4a1 1 0 011 1v2H9V5a1 1 0 011-1zM6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M10 11v6M14 11v6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : null
          }
        />

        <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <section className="mb-4">
            <SectionTitle>Origen de la emoción</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {ORIGINS.map((origin) => {
                const active = state.filter.origin === origin;
                return (
                  <button
                    key={origin}
                    type="button"
                    onClick={() => state.toggleOrigin(origin)}
                    aria-pressed={active}
                    className={[
                      "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition",
                      active
                        ? "border-ink-100 bg-ink-100 text-ink-950"
                        : "border-ink-700 bg-ink-850 text-ink-300 hover:border-ink-600",
                    ].join(" ")}
                  >
                    <span aria-hidden>{ORIGIN_ICON[origin]}</span>
                    <span className="truncate">{ORIGIN_LABEL[origin]}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {canPickValence ? (
            <section className="mb-4">
              <SectionTitle>Signo</SectionTitle>
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
            </section>
          ) : null}

          {visibleCounts.length > 0 ? (
            <section className="mb-4">
              <SectionTitle>Emociones</SectionTitle>
              <EmotionChipGrid entries={visibleCounts} activeKeys={state.activeKeys} onToggle={state.toggleEmotion} />
            </section>
          ) : null}

          {areaItems.length > 0 ? (
            <section className="mb-4">
              <SectionTitle>{TAG_LABEL.AREA}</SectionTitle>
              <ChipGrid
                items={areaItems}
                activeKeys={state.filter.areas}
                onToggle={(key) => state.toggleTag("AREA", key)}
              />
            </section>
          ) : null}

          {involvedItems.length > 0 ? (
            <section>
              <SectionTitle>{TAG_LABEL.INVOLUCRADO}</SectionTitle>
              <ChipGrid
                items={involvedItems}
                activeKeys={state.filter.involved}
                onToggle={(key) => state.toggleTag("INVOLUCRADO", key)}
              />
            </section>
          ) : null}
        </div>
      </Modal>

      {showSort ? (
        <>
          <div className="ml-auto">
            <TriggerPill onClick={() => setSortOpen(true)}>
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
                <path
                  d="M7 4v16M7 4L4 7M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>
                Ordena: <span className="font-semibold text-ink-100">{currentSortLabel}</span>
              </span>
            </TriggerPill>
          </div>

          <Modal open={sortOpen} onClose={() => setSortOpen(false)} labelledBy="ordenar-por" panelClassName="max-w-xs">
            <ModalHeader id="ordenar-por" title="Ordenar por" onClose={() => setSortOpen(false)} />
            <div className="flex flex-col gap-1.5 px-5 py-4">
              {SORT_OPTIONS.map((option) => {
                const active = state.sort === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      state.setSort(option.value);
                      setSortOpen(false);
                    }}
                    className={[
                      "flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm font-medium transition",
                      active
                        ? "border-ink-100 bg-ink-100 text-ink-950"
                        : "border-ink-700 bg-ink-850 text-ink-300 hover:border-ink-600",
                    ].join(" ")}
                  >
                    {option.label}
                    {active ? (
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Modal>
        </>
      ) : null}
    </div>
  );
}
