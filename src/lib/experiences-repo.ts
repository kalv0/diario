import "server-only";

import { prisma } from "./db";
import { parseOrigin } from "./origin";
import type { Experience, ExperienceInput } from "./types";

/** Emociones de mayor a menor nivel; pensamientos y respuesta en su orden. */
const INCLUDE = {
  emotions: { orderBy: { level: "desc" } },
  thoughts: { orderBy: { position: "asc" } },
  actions: { orderBy: { position: "asc" } },
} as const;

interface Row {
  id: string;
  origin: string;
  occurredAt: Date;
  trigger: string;
  reflection: string | null;
  createdAt: Date;
  emotions: { name: string; valence: string; level: number }[];
  thoughts: { text: string }[];
  actions: { text: string }[];
}

function toDto(row: Row): Experience {
  return {
    id: row.id,
    // Las entradas anteriores al campo de origen eran todas situaciones externas.
    origin: parseOrigin(row.origin) ?? "EXTERNA",
    occurredAt: row.occurredAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    trigger: row.trigger,
    reflection: row.reflection ?? "",
    emotions: row.emotions.map((e) => ({
      name: e.name,
      valence: e.valence === "POSITIVA" ? "POSITIVA" : "NEGATIVA",
      level: e.level,
    })),
    thoughts: row.thoughts.map((t) => t.text),
    actions: row.actions.map((a) => a.text),
  };
}

/**
 * Todas las entradas del usuario. El diario de una persona cabe de sobra en
 * memoria (miles de registros como mucho), así que el filtrado por fecha,
 * origen, emoción y orden se hace en el cliente: cambiar un filtro no cuesta
 * un viaje al servidor.
 */
export async function listExperiences(userId: string): Promise<Experience[]> {
  const rows = await prisma.experience.findMany({
    where: { userId },
    orderBy: { occurredAt: "desc" },
    include: INCLUDE,
  });
  return rows.map(toDto);
}

export async function createExperience(userId: string, input: ExperienceInput): Promise<Experience> {
  const row = await prisma.experience.create({
    data: {
      userId,
      origin: input.origin,
      occurredAt: new Date(input.occurredAt),
      trigger: input.trigger,
      reflection: input.reflection || null,
      emotions: { create: input.emotions },
      thoughts: { create: input.thoughts.map((text, position) => ({ text, position })) },
      actions: { create: input.actions.map((text, position) => ({ text, position })) },
    },
    include: INCLUDE,
  });
  return toDto(row);
}
