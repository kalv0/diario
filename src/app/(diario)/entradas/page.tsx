import type { Metadata } from "next";
import { EntriesView } from "@/components/views/EntriesView";

export const metadata: Metadata = { title: "Entradas del diario · Diario de emociones" };

export default function Page() {
  return <EntriesView />;
}
