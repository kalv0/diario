"use client";

import { useMemo } from "react";
import { AppHeader } from "../AppHeader";
import { EntryFilterControls } from "../EntryFilterControls";
import { ExperienceResults } from "../ExperienceResults";
import { useHref, useJournal } from "../JournalProvider";
import { useEntryFilter } from "../useEntryFilter";
import { filterEntries, sortExperiences } from "@/lib/journal";

/**
 * Listado completo de entradas del diario. Entra sin filtros y ordenado de más
 * reciente a menos; hereda siempre el rango de fechas de la cabecera.
 */
export function EntriesView() {
  const { experiences } = useJournal();
  const href = useHref();
  const state = useEntryFilter();

  const list = useMemo(
    () => sortExperiences(filterEntries(experiences, state.filter), state.sort),
    [experiences, state.filter, state.sort],
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader backHref={href("/")} />

      <main className="flex-1 px-4 pt-4" style={{ paddingBottom: "calc(2rem + var(--safe-bottom))" }}>
        <h1 className="mb-3 text-lg font-semibold">Entradas del diario</h1>

        <div className="mb-4">
          <EntryFilterControls source={experiences} state={state} />
        </div>

        <ExperienceResults
          experiences={list}
          emptyMessage="No hay entradas en este rango de fechas con estos filtros."
        />
      </main>
    </div>
  );
}
