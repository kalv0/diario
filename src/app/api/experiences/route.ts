import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { parseExperienceInput } from "@/lib/experience-input";
import { createExperience, listExperiences } from "@/lib/experiences-repo";

export const dynamic = "force-dynamic";

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

  const parsed = parseExperienceInput(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const experience = await createExperience(user.id, parsed.value);
  return NextResponse.json({ experience }, { status: 201 });
}
