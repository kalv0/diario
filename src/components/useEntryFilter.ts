"use client";

import { useCallback, useMemo, useState } from "react";
import { EMPTY_ENTRY_FILTER, isEntryFilterActive, type EntryFilter, type SortMode } from "@/lib/journal";
import type { Origin, TagKind, Valence } from "@/lib/types";

/**
 * Estado de filtros compartido por el listado de entradas, la línea de tiempo
 * y las páginas de grupo.
 *
 * Origen y signo son de selección única cada uno: marcar «positivas» desmarca
 * «negativas», y marcar «situación externa» desmarca «pensamiento interno».
 * Volver a pulsar el que ya está activo lo quita y vuelven a verse los dos.
 *
 * Al cambiar de signo se descartan las emociones concretas del signo
 * contrario, porque dejan de estar disponibles en el selector y un filtro
 * activo que no se ve es un filtro que nadie entiende.
 *
 * Regla de orden: en cuanto hay alguna emoción concreta marcada se ordena por
 * intensidad; al desmarcarlas todas se vuelve al orden por defecto (recientes
 * primero). Si el usuario elige un orden a mano, su elección manda hasta que
 * vuelva a tocar los filtros.
 */
export function useEntryFilter(initial: EntryFilter = EMPTY_ENTRY_FILTER) {
  const [filter, setFilter] = useState<EntryFilter>(initial);
  const [manualSort, setManualSort] = useState<SortMode | null>(null);

  const toggleEmotion = useCallback((key: string, valence: Valence) => {
    setManualSort(null);
    setFilter((prev) => ({
      ...prev,
      emotions: prev.emotions.some((e) => e.key === key)
        ? prev.emotions.filter((e) => e.key !== key)
        : [...prev.emotions, { key, valence }],
    }));
  }, []);

  const toggleValence = useCallback((valence: Valence) => {
    setManualSort(null);
    setFilter((prev) => {
      const next = prev.valence === valence ? null : valence;
      return {
        ...prev,
        valence: next,
        emotions: next === null ? prev.emotions : prev.emotions.filter((e) => e.valence === next),
      };
    });
  }, []);

  const toggleTag = useCallback((kind: TagKind, key: string) => {
    setManualSort(null);
    setFilter((prev) => {
      const field = kind === "AREA" ? "areas" : "involved";
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
      };
    });
  }, []);

  const toggleOrigin = useCallback((origin: Origin) => {
    setManualSort(null);
    setFilter((prev) => ({ ...prev, origin: prev.origin === origin ? null : origin }));
  }, []);

  const clear = useCallback(() => {
    setManualSort(null);
    setFilter(EMPTY_ENTRY_FILTER);
  }, []);

  const autoSort: SortMode = filter.emotions.length > 0 ? "intensidad" : "recientes";
  const sort = manualSort ?? autoSort;

  /** Claves marcadas, para pintar el estado en el diagrama de barras. */
  const activeKeys = useMemo(() => filter.emotions.map((e) => e.key), [filter.emotions]);

  return useMemo(
    () => ({
      filter,
      sort,
      activeKeys,
      active: isEntryFilterActive(filter),
      toggleEmotion,
      toggleValence,
      toggleOrigin,
      toggleTag,
      clear,
      setSort: setManualSort,
    }),
    [filter, sort, activeKeys, toggleEmotion, toggleValence, toggleOrigin, toggleTag, clear],
  );
}

export type EntryFilterState = ReturnType<typeof useEntryFilter>;
