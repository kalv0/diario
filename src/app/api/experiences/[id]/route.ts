import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { parseExperienceInput } from "@/lib/experience-input";
import { deleteExperience, updateExperience } from "@/lib/experiences-repo";

export const dynamic = "force-dynamic";

/**
 * Edición y borrado de una entrada. Las dos operaciones filtran por `userId`
 * además de por `id`: sin eso, conocer un id ajeno bastaría para tocar el
 * diario de otro.
 */

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = parseExperienceInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const experience = await updateExperience(user.id, id, parsed.value);
  if (!experience) return NextResponse.json({ error: "La entrada no existe." }, { status: 404 });

  return NextResponse.json({ experience });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await params;
  const deleted = await deleteExperience(user.id, id);
  if (!deleted) return NextResponse.json({ error: "La entrada no existe." }, { status: 404 });

  return NextResponse.json({ ok: true });
}
