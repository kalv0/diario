import { notFound } from "next/navigation";
import { GroupView } from "@/components/views/GroupView";
import type { GroupType } from "@/lib/types";

const GROUPS: GroupType[] = ["positivas", "negativas", "ambiguas"];

export default async function Page({ params }: { params: Promise<{ tipo: string }> }) {
  const { tipo } = await params;
  if (!(GROUPS as string[]).includes(tipo)) notFound();

  return <GroupView group={tipo as GroupType} />;
}
