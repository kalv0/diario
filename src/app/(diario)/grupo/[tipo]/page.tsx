import { notFound } from "next/navigation";
import { GroupView } from "@/components/views/GroupView";
import { GROUP_TITLE } from "@/lib/emotions";
import type { GroupType } from "@/lib/types";

const GROUPS: GroupType[] = ["positivas", "negativas", "ambiguas"];

function parseGroup(value: string): GroupType | null {
  return (GROUPS as string[]).includes(value) ? (value as GroupType) : null;
}

export async function generateMetadata({ params }: { params: Promise<{ tipo: string }> }) {
  const { tipo } = await params;
  const group = parseGroup(tipo);
  return { title: group ? `${GROUP_TITLE[group]} · Diario de situaciones` : "Diario de situaciones" };
}

export default async function Page({ params }: { params: Promise<{ tipo: string }> }) {
  const { tipo } = await params;
  const group = parseGroup(tipo);
  if (!group) notFound();

  return <GroupView group={group} />;
}
