import catalog from "@data/emotion-catalog.json";
import type { EmotionEntry, Experience, GroupType, Valence } from "./types";

/** Catálogo base, precargado y clasificado. */
export const BASE_CATALOG: Record<Valence, string[]> = {
  POSITIVA: catalog.POSITIVA,
  NEGATIVA: catalog.NEGATIVA,
};

const BASE_INDEX = new Map<string, Valence>([
  ...BASE_CATALOG.POSITIVA.map((n) => [normalize(n), "POSITIVA"] as const),
  ...BASE_CATALOG.NEGATIVA.map((n) => [normalize(n), "NEGATIVA"] as const),
]);

/** Normaliza para comparar sin acentos ni mayúsculas (evita duplicados por tildes). */
export function normalize(name: string): string {
  return name
    .trim()
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Valencia de una emoción del catálogo base, si la conoce. */
export function baseValenceOf(name: string): Valence | null {
  return BASE_INDEX.get(normalize(name)) ?? null;
}

/**
 * Catálogo efectivo: el base más las emociones personalizadas que el usuario
 * ya ha registrado en alguna experiencia. Se ordena alfabéticamente y las
 * personalizadas quedan marcadas para poder distinguirlas en la UI.
 */
export function buildCatalog(experiences: Experience[]): Record<Valence, CatalogEntry[]> {
  const custom = new Map<string, CatalogEntry>();

  for (const exp of experiences) {
    for (const emotion of exp.emotions) {
      const key = normalize(emotion.name);
      if (BASE_INDEX.has(key) || custom.has(key)) continue;
      custom.set(key, { name: emotion.name, valence: emotion.valence, custom: true });
    }
  }

  const collator = new Intl.Collator("es");
  const build = (valence: Valence): CatalogEntry[] =>
    [
      ...BASE_CATALOG[valence].map((name) => ({ name, valence, custom: false })),
      ...[...custom.values()].filter((e) => e.valence === valence),
    ].sort((a, b) => collator.compare(a.name, b.name));

  return { POSITIVA: build("POSITIVA"), NEGATIVA: build("NEGATIVA") };
}

export interface CatalogEntry {
  name: string;
  valence: Valence;
  custom: boolean;
}

/** Emociones de una experiencia filtradas por signo. */
export function emotionsOf(exp: Experience, valence: Valence): EmotionEntry[] {
  return exp.emotions.filter((e) => e.valence === valence);
}

/** La emoción de mayor nivel de un signo (desempate: la primera registrada). */
export function dominant(exp: Experience, valence: Valence): EmotionEntry | null {
  let best: EmotionEntry | null = null;
  for (const e of exp.emotions) {
    if (e.valence !== valence) continue;
    if (!best || e.level > best.level) best = e;
  }
  return best;
}

/** Color asociado a cada grupo, usado en burbujas, barras y línea de tiempo. */
export const GROUP_COLOR: Record<GroupType, string> = {
  positivas: "#22c55e",
  negativas: "#ef4444",
  ambiguas: "#eab308",
};

export const GROUP_LABEL: Record<GroupType, string> = {
  positivas: "positivas",
  negativas: "negativas",
  ambiguas: "ambiguas",
};

export const GROUP_TITLE: Record<GroupType, string> = {
  positivas: "Entradas positivas",
  negativas: "Entradas negativas",
  ambiguas: "Entradas ambiguas",
};

export const GROUP_SINGULAR: Record<GroupType, string> = {
  positivas: "Entrada positiva",
  negativas: "Entrada negativa",
  ambiguas: "Entrada ambigua",
};
