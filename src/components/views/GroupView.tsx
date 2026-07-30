"use client";

import { useMemo } from "react";
import { AppHeader } from "../AppHeader";
import { EmotionFilterControls } from "../EmotionFilterControls";
import { ExperienceResults } from "../ExperienceResults";
import { GroupBarChart } from "../GroupBarChart";
import { useHref, useJournal } from "../JournalProvider";
import { useEmotionFilter } from "../useEmotionFilter";
import { GROUP_COLOR, GROUP_TITLE } from "@/lib/emotions";
import { classify, emotionCounts, filterByEmotions, situationsLabel, sortExperiences } from "@/lib/journal";
import type { GroupType } from "@/lib/types";

/**
 * Página completa de un grupo (positivas, negativas o ambiguas): diagrama de
 * barras de sus emociones y, debajo, el listado. Pulsar una barra marca o
 * desmarca esa emoción, exactamente igual que hacerlo en el selector.
 */
export function GroupView({ group }: { group: GroupType }) {
  const { experiences } = useJournal();
  const href = useHref();
  const state = useEmotionFilter();

  const groupExperiences = useMemo(
    () => experiences.filter((exp) => classify(exp) === group),
    [experiences, group],
  );

  const counts = useMemo(() => emotionCounts(groupExperiences), [groupExperiences]);

  const list = useMemo(
    () => sortExperiences(filterByEmotions(groupExperiences, state.filter), state.sort),
    [groupExperiences, state.filter, state.sort],
  );

  const color = GROUP_COLOR[group];

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader backHref={href("/")} />

      <main className="flex-1 px-4 pt-4" style={{ paddingBottom: "calc(2rem + var(--safe-bottom))" }}>
        <h1 className="mb-1 flex items-center gap-2 text-lg font-semibold">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
          {GROUP_TITLE[group]}
        </h1>
        <p className="mb-3 text-xs text-ink-400">
          {groupExperiences.length} {situationsLabel(group, groupExperiences.length)} en el rango seleccionado
        </p>

        <div className="mb-3">
          <GroupBarChart counts={counts} activeKeys={state.filter.emotions} onToggle={state.toggleEmotion} />
        </div>

        <div className="mb-4">
          <EmotionFilterControls source={groupExperiences} state={state} showValences={group === "ambiguas"} />
        </div>

        <ExperienceResults
          experiences={list}
          emptyMessage="No hay experiencias de este grupo en el rango seleccionado."
        />
      </main>
    </div>
  );
}
