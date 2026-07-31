"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_FILTER, resolveRange, type DateFilter, type DateRange } from "@/lib/date-filter";
import { buildCatalog, type CatalogEntry } from "@/lib/emotions";
import { demoExperienceFromInput } from "@/lib/demo-data";
import { earliestDate, filterByRange } from "@/lib/journal";
import type { Experience, ExperienceInput, Valence } from "@/lib/types";

export type JournalMode = "api" | "demo";

interface JournalContextValue {
  mode: JournalMode;
  /** "" para el diario real, "/demo" para la demo. Prefija todos los enlaces. */
  basePath: string;
  username: string | null;
  /** Todas las entradas, sin filtro de fecha. */
  allExperiences: Experience[];
  /** Las que caen dentro del filtro de fecha de la barra superior. */
  experiences: Experience[];
  range: DateRange;
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  addExperience: (input: ExperienceInput) => Promise<void>;
  catalog: Record<Valence, CatalogEntry[]>;
  /** Fecha del registro más antiguo: tope al retroceder de mes en el calendario. */
  earliest: Date | null;
}

const JournalContext = createContext<JournalContextValue | null>(null);

export function useJournal(): JournalContextValue {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error("useJournal debe usarse dentro de <JournalProvider>");
  return ctx;
}

/** Construye una ruta interna respetando el prefijo /demo. */
export function useHref(): (path: string) => string {
  const { basePath } = useJournal();
  return useCallback((path: string) => `${basePath}${path === "/" ? "" : path}` || "/", [basePath]);
}

export function JournalProvider({
  mode,
  basePath,
  username = null,
  initialExperiences,
  children,
}: {
  mode: JournalMode;
  basePath: string;
  username?: string | null;
  initialExperiences: Experience[];
  children: React.ReactNode;
}) {
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [dateFilter, setDateFilter] = useState<DateFilter>(DEFAULT_FILTER);

  const addExperience = useCallback(
    async (input: ExperienceInput) => {
      if (mode === "demo") {
        // En la demo no se persiste nada: vive solo en memoria hasta recargar.
        setExperiences((prev) => [demoExperienceFromInput(input), ...prev]);
        return;
      }

      const response = await fetch("/api/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "No se ha podido guardar la experiencia.");
      }

      const { experience } = (await response.json()) as { experience: Experience };
      setExperiences((prev) => [experience, ...prev]);
    },
    [mode],
  );

  // `earliest` sale de las entradas sin filtrar, así que puede alimentar al
  // rango sin ciclo: el filtro de fechas depende de él, no al revés.
  const earliest = useMemo(() => earliestDate(experiences), [experiences]);

  // El rango se recalcula en cada render para que "hoy" siga siendo hoy aunque
  // la pestaña lleve horas abierta.
  const range = useMemo(() => resolveRange(dateFilter, new Date(), earliest), [dateFilter, earliest]);
  const filtered = useMemo(() => filterByRange(experiences, range), [experiences, range]);
  const catalog = useMemo(() => buildCatalog(experiences), [experiences]);

  const value = useMemo<JournalContextValue>(
    () => ({
      mode,
      basePath,
      username,
      allExperiences: experiences,
      experiences: filtered,
      range,
      dateFilter,
      setDateFilter,
      addExperience,
      catalog,
      earliest,
    }),
    [mode, basePath, username, experiences, filtered, range, dateFilter, addExperience, catalog, earliest],
  );

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}
