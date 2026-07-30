"use client";

import { useCallback, useMemo, useState } from "react";
import { EMPTY_EMOTION_FILTER, isEmotionFilterActive, type EmotionFilter, type SortMode } from "@/lib/journal";
import type { Valence } from "@/lib/types";

/**
 * Estado de filtros por emoción compartido por el listado, la línea de tiempo
 * y las páginas de grupo.
 *
 * El signo es de selección única: marcar «positivas» desmarca «negativas» y
 * volver a pulsar el que ya está activo lo quita. Al cambiar de signo se
 * descartan las emociones concretas del signo contrario, porque dejan de estar
 * disponibles en el selector y un filtro activo que no se ve es un filtro que
 * nadie entiende.
 *
 * Regla de orden: en cuanto hay alguna emoción concreta marcada se ordena por
 * intensidad; al desmarcarlas todas se vuelve al orden por defecto (recientes
 * primero). Si el usuario elige un orden a mano, su elección manda hasta que
 * vuelva a tocar los filtros.
 */
export function useEmotionFilter(initial: EmotionFilter = EMPTY_EMOTION_FILTER) {
  const [filter, setFilter] = useState<EmotionFilter>(initial);
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
        valence: next,
        emotions: next === null ? prev.emotions : prev.emotions.filter((e) => e.valence === next),
      };
    });
  }, []);

  const clear = useCallback(() => {
    setManualSort(null);
    setFilter(EMPTY_EMOTION_FILTER);
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
      active: isEmotionFilterActive(filter),
      toggleEmotion,
      toggleValence,
      clear,
      setSort: setManualSort,
    }),
    [filter, sort, activeKeys, toggleEmotion, toggleValence, clear],
  );
}

export type EmotionFilterState = ReturnType<typeof useEmotionFilter>;
