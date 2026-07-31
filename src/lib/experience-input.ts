import { normalize } from "./emotions";
import { parseOrigin } from "./origin";
import type { ExperienceInput, Valence } from "./types";

/**
 * Validación de lo que llega del formulario. La comparten el alta y la
 * edición: si las reglas se duplicaran, tarde o temprano una de las dos
 * dejaría pasar algo que la otra rechaza.
 *
 * Nunca confiamos en el cliente, aunque el formulario ya valide por su cuenta.
 */

const MAX_TRIGGER = 4000;
const MAX_REFLECTION = 8000;
const MAX_ITEM = 1000;
const MAX_ITEMS = 30;
const MAX_EMOTIONS = 12;
const MAX_NAME = 60;
const MAX_TAGS = 20;

export type ParseResult = { ok: true; value: ExperienceInput } | { ok: false; error: string };

export function parseExperienceInput(body: unknown): ParseResult {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Cuerpo inválido." };
  const raw = body as Record<string, unknown>;

  const origin = parseOrigin(raw.origin);
  if (!origin) return { ok: false, error: "Elige el origen de la emoción." };

  const occurredAt = new Date(String(raw.occurredAt ?? ""));
  if (Number.isNaN(occurredAt.getTime())) return { ok: false, error: "La fecha y hora no son válidas." };

  const description = String(raw.description ?? "").trim();
  if (!description) return { ok: false, error: "Escribe qué pasó." };
  if (description.length > MAX_TRIGGER) return { ok: false, error: "La descripción es demasiado larga." };

  const reflection = String(raw.reflection ?? "").trim();
  if (reflection.length > MAX_REFLECTION) return { ok: false, error: "La reflexión es demasiado larga." };

  if (!Array.isArray(raw.emotions) || raw.emotions.length === 0) {
    return { ok: false, error: "Añade al menos una emoción." };
  }
  if (raw.emotions.length > MAX_EMOTIONS) return { ok: false, error: "Demasiadas emociones." };

  const emotions: ExperienceInput["emotions"] = [];
  for (const item of raw.emotions) {
    if (typeof item !== "object" || item === null) return { ok: false, error: "Emoción inválida." };
    const e = item as Record<string, unknown>;
    const name = String(e.name ?? "").trim();
    const valence = String(e.valence ?? "");
    const level = Number(e.level);
    if (!name || name.length > MAX_NAME) return { ok: false, error: "Nombre de emoción inválido." };
    if (valence !== "POSITIVA" && valence !== "NEGATIVA") return { ok: false, error: "Signo de emoción inválido." };
    if (!Number.isFinite(level) || level < 0 || level > 10) return { ok: false, error: "El nivel debe ir de 0 a 10." };
    emotions.push({ name, valence: valence as Valence, level: Math.round(level) });
  }

  // Áreas e involucrados: nombres libres, sin repetir (comparando sin acentos
  // ni mayúsculas, igual que las emociones) y conservando el orden de entrada.
  const cleanTags = (value: unknown): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const item of Array.isArray(value) ? value : []) {
      const name = String(item ?? "").trim().slice(0, MAX_NAME);
      if (!name) continue;
      const key = normalize(name);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(name);
      if (out.length >= MAX_TAGS) break;
    }
    return out;
  };

  const areas = cleanTags(raw.areas);
  if (areas.length === 0) return { ok: false, error: "Elige al menos un área." };
  const involved = cleanTags(raw.involved);

  const cleanList = (value: unknown): string[] =>
    (Array.isArray(value) ? value : [])
      .map((v) => String(v ?? "").trim())
      .filter(Boolean)
      .slice(0, MAX_ITEMS)
      .map((v) => v.slice(0, MAX_ITEM));

  return {
    ok: true,
    value: {
      origin,
      occurredAt: occurredAt.toISOString(),
      description,
      emotions,
      areas,
      involved,
      thoughts: cleanList(raw.thoughts),
      actions: cleanList(raw.actions),
      reflection,
    },
  };
}
