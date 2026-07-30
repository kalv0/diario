"use client";

import { useCallback, useMemo, useState } from "react";
import { EMPTY_EMOTION_FILTER, isEmotionFilterActive, type EmotionFilter, type SortMode } from "@/lib/journal";
import type { Valence } from "@/lib/types";

/**
 * Estado de filtros por emoción compartido por el listado, la línea de tiempo
 * y las páginas de grupo.
 *
 * Regla de orden: en cuanto hay alguna emoción concreta marcada se ordena por
 * intensidad; al desmarcarlas todas se vuelve al orden por defecto (recientes
 * primero). Si el usuario elige un orden a mano, su elección manda hasta que
 * vuelva a tocar los filtros.
 */
export function useEmotionFilter(initial: EmotionFilter = EMPTY_EMOTION_FILTER) {
  const [filter, setFilter] = useState<EmotionFilter>(initial);
  const [manualSort, setManualSort] = useState<SortMode | null>(null);

  const toggleEmotion = useCallback((key: string) => {
    setManualSort(null);
    setFilter((prev) => ({
      ...prev,
      emotions: prev.emotions.includes(key) ? prev.emotions.filter((e) => e !== key) : [...prev.emotions, key],
    }));
  }, []);

  const toggleValence = useCallback((valence: Valence) => {
    setManualSort(null);
    setFilter((prev) => ({
      ...prev,
      valences: prev.valences.includes(valence)
        ? prev.valences.filter((v) => v !== valence)
        : [...prev.valences, valence],
    }));
  }, []);

  const clear = useCallback(() => {
    setManualSort(null);
    setFilter(EMPTY_EMOTION_FILTER);
  }, []);

  const autoSort: SortMode = filter.emotions.length > 0 ? "intensidad" : "recientes";
  const sort = manualSort ?? autoSort;

  return useMemo(
    () => ({
      filter,
      sort,
      active: isEmotionFilterActive(filter),
      toggleEmotion,
      toggleValence,
      clear,
      setSort: setManualSort,
    }),
    [filter, sort, toggleEmotion, toggleValence, clear],
  );
}

export type EmotionFilterState = ReturnType<typeof useEmotionFilter>;
