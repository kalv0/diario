import areaCatalog from "@data/area-catalog.json";
import { normalize } from "./emotions";
import type { Experience, TagKind } from "./types";

/**
 * Áreas de vida e involucrados: dos listas de etiquetas libres que funcionan
 * igual que el catálogo de emociones. Hay un catálogo base para las áreas y
 * ninguno para los involucrados —esos son de cada uno— y en los dos casos lo
 * que se ofrece es la unión del base con lo que ya se haya escrito antes.
 */

export const AREA_BASE: string[] = areaCatalog;

export const TAG_KINDS: TagKind[] = ["AREA", "INVOLUCRADO"];

export const TAG_LABEL: Record<TagKind, string> = {
  AREA: "Área",
  INVOLUCRADO: "Involucrados",
};

export const TAG_HINT: Record<TagKind, string> = {
  AREA: "¿En qué área de mi vida ocurrió?",
  INVOLUCRADO: "¿Con quién o con qué está relacionado?",
};

export const TAG_PLACEHOLDER: Record<TagKind, string> = {
  AREA: "Buscar o escribir un área nueva…",
  INVOLUCRADO: "Buscar o escribir quién o qué…",
};

/** Color con el que se pintan los chips de cada tipo. */
export const TAG_COLOR: Record<TagKind, string> = {
  AREA: "#38bdf8",
  INVOLUCRADO: "#c084fc",
};

export function parseTagKind(value: unknown): TagKind | null {
  return value === "AREA" || value === "INVOLUCRADO" ? value : null;
}

function namesOf(exp: Experience, kind: TagKind): string[] {
  return kind === "AREA" ? exp.areas : exp.involved;
}

/**
 * Catálogo que se ofrece al escribir: el base del tipo más todo lo que ya
 * aparezca en alguna entrada, sin repetir y ordenado alfabéticamente.
 */
export function buildTagCatalog(experiences: Experience[], kind: TagKind): string[] {
  const seen = new Map<string, string>();
  for (const name of kind === "AREA" ? AREA_BASE : []) seen.set(normalize(name), name);
  for (const exp of experiences) {
    for (const name of namesOf(exp, kind)) {
      const key = normalize(name);
      if (!seen.has(key)) seen.set(key, name);
    }
  }
  const collator = new Intl.Collator("es");
  return [...seen.values()].sort((a, b) => collator.compare(a, b));
}

export interface TagCount {
  key: string;
  label: string;
  count: number;
}

/** Recuento por etiqueta, para las listas de filtro. Más usadas primero. */
export function tagCounts(experiences: Experience[], kind: TagKind): TagCount[] {
  const counts = new Map<string, TagCount>();
  for (const exp of experiences) {
    const seen = new Set<string>();
    for (const name of namesOf(exp, kind)) {
      const key = normalize(name);
      if (seen.has(key)) continue;
      seen.add(key);
      const entry = counts.get(key);
      if (entry) entry.count += 1;
      else counts.set(key, { key, label: name, count: 1 });
    }
  }
  const collator = new Intl.Collator("es");
  return [...counts.values()].sort((a, b) => b.count - a.count || collator.compare(a.label, b.label));
}
