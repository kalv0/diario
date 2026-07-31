"use client";

import { useMemo } from "react";
import { ChipGrid } from "./ChipGrid";
import { GROUP_COLOR } from "@/lib/emotions";
import type { EmotionCount } from "@/lib/journal";
import type { Valence } from "@/lib/types";

const VALENCE_COLOR: Record<Valence, string> = {
  POSITIVA: GROUP_COLOR.positivas,
  NEGATIVA: GROUP_COLOR.negativas,
};

/** Chips de emoción del filtro: `ChipGrid` con el color del signo de cada una. */
export function EmotionChipGrid({
  entries,
  activeKeys,
  onToggle,
}: {
  entries: EmotionCount[];
  activeKeys: string[];
  onToggle: (key: string, valence: Valence) => void;
}) {
  const items = useMemo(
    () => entries.map((e) => ({ key: e.key, label: e.label, count: e.count, color: VALENCE_COLOR[e.valence] })),
    [entries],
  );

  const byKey = useMemo(() => new Map(entries.map((e) => [e.key, e.valence])), [entries]);

  return (
    <ChipGrid
      items={items}
      activeKeys={activeKeys}
      onToggle={(key) => {
        const valence = byKey.get(key);
        if (valence) onToggle(key, valence);
      }}
    />
  );
}
