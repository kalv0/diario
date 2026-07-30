"use client";

import { useMemo } from "react";
import { AppHeader } from "../AppHeader";
import { EmotionFilterControls } from "../EmotionFilterControls";
import { ExperienceResults } from "../ExperienceResults";
import { useHref, useJournal } from "../JournalProvider";
import { Timeline } from "../Timeline";
import { useEmotionFilter } from "../useEmotionFilter";
import { filterByEmotions, sortExperiences, timelineSeries } from "@/lib/journal";

/**
 * Línea de tiempo del rango activo, con el listado debajo en sintonía con los
 * mismos filtros de emoción.
 */
export function TimelineView() {
  const { experiences, range } = useJournal();
  const href = useHref();
  const state = useEmotionFilter();

  const filtered = useMemo(() => filterByEmotions(experiences, state.filter), [experiences, state.filter]);
  const days = useMemo(() => timelineSeries(filtered, range), [filtered, range]);
  const list = useMemo(() => sortExperiences(filtered, state.sort), [filtered, state.sort]);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader backHref={href("/")} />

      <main className="flex-1 px-4 pt-4" style={{ paddingBottom: "calc(2rem + var(--safe-bottom))" }}>
        <h1 className="mb-3 text-lg font-semibold">Línea de tiempo</h1>

        <div className="mb-3">
          <Timeline days={days} />
        </div>

        <div className="mb-4">
          <EmotionFilterControls source={experiences} state={state} />
        </div>

        <ExperienceResults
          experiences={list}
          emptyMessage="No hay experiencias en este rango de fechas con estos filtros."
        />
      </main>
    </div>
  );
}
