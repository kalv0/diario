import { dayKey, eachDayKey, type DateRange } from "./date-filter";
import { dominant, normalize } from "./emotions";
import type { Bubble, Experience, GroupType, Valence } from "./types";

/* -------------------------------------------------------------------------- */
/* Clasificación                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Una situación es positiva si solo tiene emociones positivas, negativa si solo
 * tiene negativas y ambigua si tiene de los dos signos. Sin emociones se trata
 * como ambigua (no debería ocurrir: el formulario exige al menos una).
 */
export function classify(exp: Experience): GroupType {
  let pos = false;
  let neg = false;
  for (const e of exp.emotions) {
    if (e.valence === "POSITIVA") pos = true;
    else neg = true;
  }
  if (pos && neg) return "ambiguas";
  if (pos) return "positivas";
  if (neg) return "negativas";
  return "ambiguas";
}

/** Intensidad de la experiencia: el nivel más alto de todas sus emociones. */
export function maxLevel(exp: Experience): number {
  return exp.emotions.reduce((max, e) => Math.max(max, e.level), 0);
}

/**
 * Etiqueta de burbuja de una situación ambigua: la emoción positiva de mayor
 * nivel combinada con la negativa de mayor nivel ("par dominante"). Cada
 * experiencia aporta exactamente una burbuja, así la suma de burbujas coincide
 * con el recuento de situaciones del grupo.
 */
export function mixedPairLabel(exp: Experience): string {
  const pos = dominant(exp, "POSITIVA");
  const neg = dominant(exp, "NEGATIVA");
  if (!pos || !neg) return pos?.name ?? neg?.name ?? "Sin emoción";
  return `${pos.name} + ${neg.name}`;
}

/* -------------------------------------------------------------------------- */
/* Agrupaciones                                                                */
/* -------------------------------------------------------------------------- */

export type GroupedExperiences = Record<GroupType, Experience[]>;

export function groupExperiences(experiences: Experience[]): GroupedExperiences {
  const grouped: GroupedExperiences = { positivas: [], negativas: [], ambiguas: [] };
  for (const exp of experiences) grouped[classify(exp)].push(exp);
  return grouped;
}

/**
 * Burbujas de un grupo. En positivas/negativas hay una burbuja por emoción
 * distinta; en ambiguas, una por combinación única positiva+negativa.
 */
export function bubblesFor(group: GroupType, experiences: Experience[]): Bubble[] {
  const counts = new Map<string, { label: string; count: number }>();

  const bump = (label: string) => {
    const key = normalize(label);
    const entry = counts.get(key);
    if (entry) entry.count += 1;
    else counts.set(key, { label, count: 1 });
  };

  for (const exp of experiences) {
    if (group === "ambiguas") {
      bump(mixedPairLabel(exp));
    } else {
      const valence: Valence = group === "positivas" ? "POSITIVA" : "NEGATIVA";
      // Una experiencia con dos emociones del mismo signo cuenta en las dos
      // burbujas, pero solo una vez en cada una.
      const seen = new Set<string>();
      for (const e of exp.emotions) {
        if (e.valence !== valence) continue;
        const key = normalize(e.name);
        if (seen.has(key)) continue;
        seen.add(key);
        bump(e.name);
      }
    }
  }

  return [...counts.entries()]
    .map(([key, { label, count }]) => ({ key, label, count, group }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"));
}

/**
 * Recuento de emociones para el diagrama de barras de la página de grupo.
 * En el grupo ambiguo se cuentan las emociones sueltas (de los dos signos),
 * no las combinaciones, que es lo que hace útil el diagrama.
 */
export interface EmotionCount {
  key: string;
  label: string;
  valence: Valence;
  count: number;
}

export function emotionCounts(experiences: Experience[]): EmotionCount[] {
  const counts = new Map<string, EmotionCount>();
  for (const exp of experiences) {
    const seen = new Set<string>();
    for (const e of exp.emotions) {
      const key = normalize(e.name);
      if (seen.has(key)) continue;
      seen.add(key);
      const entry = counts.get(key);
      if (entry) entry.count += 1;
      else counts.set(key, { key, label: e.name, valence: e.valence, count: 1 });
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"));
}

/* -------------------------------------------------------------------------- */
/* Filtros                                                                     */
/* -------------------------------------------------------------------------- */

export function withinRange(exp: Experience, range: DateRange): boolean {
  const t = new Date(exp.occurredAt).getTime();
  return t >= range.from.getTime() && t <= range.to.getTime();
}

export function filterByRange(experiences: Experience[], range: DateRange): Experience[] {
  return experiences.filter((exp) => withinRange(exp, range));
}

/** Emoción concreta marcada en el filtro. La valencia viaja con ella para poder
 *  descartarla cuando se cambia de signo. */
export interface SelectedEmotion {
  /** Clave normalizada (sin acentos ni mayúsculas). */
  key: string;
  valence: Valence;
}

export interface EmotionFilter {
  /** Signo activo. Solo puede haber uno; `null` = los dos. */
  valence: Valence | null;
  /** Emociones concretas activas. Vacío = todas. */
  emotions: SelectedEmotion[];
}

export const EMPTY_EMOTION_FILTER: EmotionFilter = { valence: null, emotions: [] };

export function isEmotionFilterActive(filter: EmotionFilter): boolean {
  return filter.valence !== null || filter.emotions.length > 0;
}

export function filterByEmotions(experiences: Experience[], filter: EmotionFilter): Experience[] {
  if (!isEmotionFilterActive(filter)) return experiences;
  const wantedEmotions = new Set(filter.emotions.map((e) => e.key));

  return experiences.filter((exp) => {
    const valenceOk = filter.valence === null || exp.emotions.some((e) => e.valence === filter.valence);
    const emotionOk = wantedEmotions.size === 0 || exp.emotions.some((e) => wantedEmotions.has(normalize(e.name)));
    return valenceOk && emotionOk;
  });
}

/* -------------------------------------------------------------------------- */
/* Orden                                                                       */
/* -------------------------------------------------------------------------- */

export type SortMode = "recientes" | "intensidad";

export function sortExperiences(experiences: Experience[], mode: SortMode): Experience[] {
  const copy = [...experiences];
  if (mode === "intensidad") {
    copy.sort((a, b) => {
      const diff = maxLevel(b) - maxLevel(a);
      if (diff !== 0) return diff;
      return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
    });
  } else {
    copy.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
  }
  return copy;
}

/* -------------------------------------------------------------------------- */
/* Línea de tiempo                                                             */
/* -------------------------------------------------------------------------- */

export interface TimelineDay {
  key: string;
  date: Date;
  /** Experiencias del día con al menos una emoción positiva. */
  positive: number;
  /** Experiencias del día con al menos una emoción negativa. */
  negative: number;
  total: number;
}

/**
 * Serie diaria del rango. Una experiencia ambigua suma en verde y en rojo,
 * igual que un valor que abre y cierra en un gráfico de bolsa.
 */
export function timelineSeries(experiences: Experience[], range: DateRange): TimelineDay[] {
  const buckets = new Map<string, { positive: number; negative: number; total: number }>();

  for (const exp of experiences) {
    const key = dayKey(new Date(exp.occurredAt));
    const bucket = buckets.get(key) ?? { positive: 0, negative: 0, total: 0 };
    if (exp.emotions.some((e) => e.valence === "POSITIVA")) bucket.positive += 1;
    if (exp.emotions.some((e) => e.valence === "NEGATIVA")) bucket.negative += 1;
    bucket.total += 1;
    buckets.set(key, bucket);
  }

  return eachDayKey(range).map((key) => {
    const bucket = buckets.get(key) ?? { positive: 0, negative: 0, total: 0 };
    const [y, m, d] = key.split("-").map(Number);
    return { key, date: new Date(y, m - 1, d), ...bucket };
  });
}

/* -------------------------------------------------------------------------- */
/* Varios                                                                      */
/* -------------------------------------------------------------------------- */

/** Fecha de la experiencia más antigua; sirve de tope al retroceder de mes. */
export function earliestDate(experiences: Experience[]): Date | null {
  let earliest: number | null = null;
  for (const exp of experiences) {
    const t = new Date(exp.occurredAt).getTime();
    if (earliest === null || t < earliest) earliest = t;
  }
  return earliest === null ? null : new Date(earliest);
}

export function pluralSituaciones(count: number): string {
  return count === 1 ? "situación" : "situaciones";
}

const GROUP_ADJECTIVE: Record<GroupType, [singular: string, plural: string]> = {
  positivas: ["positiva", "positivas"],
  negativas: ["negativa", "negativas"],
  ambiguas: ["ambigua", "ambiguas"],
};

/** "situación ambigua" / "situaciones ambiguas", concordando con el recuento. */
export function situationsLabel(group: GroupType, count: number): string {
  return `${pluralSituaciones(count)} ${GROUP_ADJECTIVE[group][count === 1 ? 0 : 1]}`;
}
