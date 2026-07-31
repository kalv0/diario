import type { Metadata } from "next";
import { TimelineView } from "@/components/views/TimelineView";

export const metadata: Metadata = { title: "Línea de tiempo · Diario de emociones" };

export default function Page() {
  return <TimelineView />;
}
