"use client";

import { useEffect, useState } from "react";
import { ExperienceCard } from "./ExperienceCard";
import { ExperienceDetail } from "./ExperienceDetail";
import { pluralEntradas } from "@/lib/journal";
import type { Experience } from "@/lib/types";

/**
 * Listado de entradas ya filtrado y ordenado, con el detalle en popup y
 * navegación entre contiguas según el orden que se está viendo.
 */
export function ExperienceResults({
  experiences,
  emptyMessage = "No hay entradas con estos filtros.",
}: {
  experiences: Experience[];
  emptyMessage?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Si cambian los filtros mientras el detalle está abierto, se cierra: el
  // índice ya no apunta a lo mismo.
  useEffect(() => {
    setOpenIndex(null);
  }, [experiences]);

  if (experiences.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-ink-800 px-4 py-10 text-center text-sm text-ink-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <>
      <p className="mb-2.5 text-xs text-ink-400">
        <span className="font-semibold text-ink-100">{experiences.length}</span>{" "}
        {pluralEntradas(experiences.length)}
      </p>

      <ul className="flex flex-col gap-2">
        {experiences.map((experience, index) => (
          <li key={experience.id}>
            <ExperienceCard experience={experience} onOpen={() => setOpenIndex(index)} />
          </li>
        ))}
      </ul>

      <ExperienceDetail
        experiences={experiences}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
      />
    </>
  );
}
