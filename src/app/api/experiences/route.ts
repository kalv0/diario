import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createExperience, listExperiences } from "@/lib/experiences-repo";
import { parseOrigin } from "@/lib/origin";
import type { ExperienceInput, Valence } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX_TRIGGER = 4000;
const MAX_REFLECTION = 8000;
const MAX_ITEM = 1000;
const MAX_ITEMS = 30;
const MAX_EMOTIONS = 12;
const MAX_NAME = 60;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  return NextResponse.json({ experiences: await listExperiences(user.id) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = parseInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const experience = await createExperience(user.id, parsed.value);
  return NextResponse.json({ experience }, { status: 201 });
}

/** Validación de lo que llega del formulario: nunca confiamos en el cliente. */
function parseInput(body: unknown): { ok: true; value: ExperienceInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) return { ok: false, error: "Cuerpo inválido." };
  const raw = body as Record<string, unknown>;

  const origin = parseOrigin(raw.origin);
  if (!origin) return { ok: false, error: "Elige el origen de la emoción." };

  const occurredAt = new Date(String(raw.occurredAt ?? ""));
  if (Number.isNaN(occurredAt.getTime())) return { ok: false, error: "La fecha y hora no son válidas." };

  const trigger = String(raw.trigger ?? "").trim();
  if (!trigger) return { ok: false, error: "Escribe el desencadenante." };
  if (trigger.length > MAX_TRIGGER) return { ok: false, error: "El desencadenante es demasiado largo." };

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
      trigger,
      emotions,
      thoughts: cleanList(raw.thoughts),
      actions: cleanList(raw.actions),
      reflection,
    },
  };
}
