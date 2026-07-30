"use client";

import { useMemo } from "react";
import { AppHeader } from "../AppHeader";
import { EmotionFilterControls } from "../EmotionFilterControls";
import { ExperienceResults } from "../ExperienceResults";
import { useHref, useJournal } from "../JournalProvider";
import { useEmotionFilter } from "../useEmotionFilter";
import { filterByEmotions, sortExperiences } from "@/lib/journal";

/**
 * Listado completo. Entra sin filtros de emoción y ordenado de más reciente a
 * menos; hereda siempre el rango de fechas de la cabecera.
 */
export function ExperiencesView() {
  const { experiences } = useJournal();
  const href = useHref();
  const state = useEmotionFilter();

  const list = useMemo(
    () => sortExperiences(filterByEmotions(experiences, state.filter), state.sort),
    [experiences, state.filter, state.sort],
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader backHref={href("/")} />

      <main className="flex-1 px-4 pt-4" style={{ paddingBottom: "calc(2rem + var(--safe-bottom))" }}>
        <h1 className="mb-3 text-lg font-semibold">Experiencias</h1>

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
