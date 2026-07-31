import type { Origin } from "./types";

/** Origen de la emoción: de fuera (pasó algo) o de dentro (apareció un pensamiento). */
export const ORIGINS: Origin[] = ["EXTERNA", "INTERNA"];

export const ORIGIN_LABEL: Record<Origin, string> = {
  EXTERNA: "Situación externa",
  INTERNA: "Pensamiento interno",
};

export const ORIGIN_ICON: Record<Origin, string> = {
  EXTERNA: "🌍",
  INTERNA: "🧠",
};

export const ORIGIN_HINT: Record<Origin, string> = {
  EXTERNA: "Algo que ocurrió fuera",
  INTERNA: "Algo que apareció en tu cabeza",
};

export function parseOrigin(value: unknown): Origin | null {
  return value === "EXTERNA" || value === "INTERNA" ? value : null;
}
