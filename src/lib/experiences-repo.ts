import "server-only";

import { prisma } from "./db";
import { parseOrigin } from "./origin";
import type { Experience, ExperienceInput } from "./types";

/** Emociones de mayor a menor nivel; pensamientos y respuesta en su orden. */
const INCLUDE = {
  emotions: { orderBy: { level: "desc" } },
  tags: { orderBy: { position: "asc" } },
  thoughts: { orderBy: { position: "asc" } },
  actions: { orderBy: { position: "asc" } },
} as const;

interface Row {
  id: string;
  origin: string;
  occurredAt: Date;
  description: string;
  reflection: string | null;
  createdAt: Date;
  emotions: { name: string; valence: string; level: number }[];
  tags: { kind: string; name: string }[];
  thoughts: { text: string }[];
  actions: { text: string }[];
}

/** Las filas de etiqueta van todas en la misma tabla; aquí se reparten por tipo. */
function tagsOf(row: Row, kind: string): string[] {
  return row.tags.filter((t) => t.kind === kind).map((t) => t.name);
}

/** Filas de ExperienceTag a partir de las dos listas del formulario. */
function tagRows(input: ExperienceInput): { kind: string; name: string; position: number }[] {
  return [
    ...input.areas.map((name, position) => ({ kind: "AREA", name, position })),
    ...input.involved.map((name, position) => ({ kind: "INVOLUCRADO", name, position })),
  ];
}

function toDto(row: Row): Experience {
  return {
    id: row.id,
    // Las entradas anteriores al campo de origen eran todas situaciones externas.
    origin: parseOrigin(row.origin) ?? "EXTERNA",
    occurredAt: row.occurredAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    description: row.description,
    reflection: row.reflection ?? "",
    areas: tagsOf(row, "AREA"),
    involved: tagsOf(row, "INVOLUCRADO"),
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

/**
 * Actualiza una entrada. Emociones, pensamientos y respuesta se reemplazan
 * enteros en vez de intentar casar fila por fila: son listas cortas sin
 * identidad propia y el diff no aportaría nada. Va en transacción para que no
 * quede una entrada a medio actualizar si algo falla.
 *
 * Devuelve null si la entrada no existe o no es de este usuario, que es lo
 * mismo de cara al cliente: no confirmamos la existencia de entradas ajenas.
 */
export async function updateExperience(
  userId: string,
  id: string,
  input: ExperienceInput,
): Promise<Experience | null> {
  const owned = await prisma.experience.findFirst({ where: { id, userId }, select: { id: true } });
  if (!owned) return null;

  const row = await prisma.$transaction(async (tx) => {
    await tx.experienceEmotion.deleteMany({ where: { experienceId: id } });
    await tx.experienceTag.deleteMany({ where: { experienceId: id } });
    await tx.thought.deleteMany({ where: { experienceId: id } });
    await tx.action.deleteMany({ where: { experienceId: id } });

    return tx.experience.update({
      where: { id },
      data: {
        origin: input.origin,
        occurredAt: new Date(input.occurredAt),
        description: input.description,
        reflection: input.reflection || null,
        emotions: { create: input.emotions },
        tags: { create: tagRows(input) },
        thoughts: { create: input.thoughts.map((text, position) => ({ text, position })) },
        actions: { create: input.actions.map((text, position) => ({ text, position })) },
      },
      include: INCLUDE,
    });
  });

  return toDto(row);
}

/** Borra una entrada del usuario. Las filas hijas caen por `onDelete: Cascade`. */
export async function deleteExperience(userId: string, id: string): Promise<boolean> {
  const { count } = await prisma.experience.deleteMany({ where: { id, userId } });
  return count > 0;
}

export async function createExperience(userId: string, input: ExperienceInput): Promise<Experience> {
  const row = await prisma.experience.create({
    data: {
      userId,
      origin: input.origin,
      occurredAt: new Date(input.occurredAt),
      description: input.description,
      reflection: input.reflection || null,
      emotions: { create: input.emotions },
      tags: { create: tagRows(input) },
      thoughts: { create: input.thoughts.map((text, position) => ({ text, position })) },
      actions: { create: input.actions.map((text, position) => ({ text, position })) },
    },
    include: INCLUDE,
  });
  return toDto(row);
}
