"use client";

import { useEffect, useState } from "react";
import { ExperienceCard } from "./ExperienceCard";
import { ExperienceDetail } from "./ExperienceDetail";
import { ExperienceForm } from "./ExperienceForm";
import { pluralEntradas } from "@/lib/journal";
import type { Experience } from "@/lib/types";

/**
 * Listado de entradas ya filtrado y ordenado, con el detalle en popup y
 * navegación entre contiguas según el orden que se está viendo.
 *
 * Desde el detalle se puede editar: se cierra el detalle y se abre el mismo
 * formulario del alta, precargado. Es aquí y no en el detalle porque al
 * guardar cambia la lista, y con ella el índice que el detalle está mirando.
 */
export function ExperienceResults({
  experiences,
  emptyMessage = "No hay entradas con estos filtros.",
}: {
  experiences: Experience[];
  emptyMessage?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [editing, setEditing] = useState<Experience | null>(null);

  // Si cambian los filtros mientras el detalle está abierto, se cierra: el
  // índice ya no apunta a lo mismo.
  useEffect(() => {
    setOpenIndex(null);
  }, [experiences]);

  return (
    <>
      {experiences.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink-800 px-4 py-10 text-center text-sm text-ink-400">
          {emptyMessage}
        </p>
      ) : (
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
            onEdit={(experience) => {
              setOpenIndex(null);
              setEditing(experience);
            }}
          />
        </>
      )}

      <ExperienceForm open={editing !== null} experience={editing} onClose={() => setEditing(null)} />
    </>
  );
}
