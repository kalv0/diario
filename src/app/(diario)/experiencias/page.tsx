import type { Metadata } from "next";
import { ExperiencesView } from "@/components/views/ExperiencesView";

export const metadata: Metadata = { title: "Experiencias · Diario de situaciones" };

export default function Page() {
  return <ExperiencesView />;
}
