import type { Metadata } from "next";
import { JournalProvider } from "@/components/JournalProvider";
import { createDemoExperiences } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Demo · Diario de emociones" };

// Los datos de ejemplo se calculan respecto a "hoy": si Next prerenderizara
// esta rama en el build, la demo iría envejeciendo hasta quedarse vacía.
export const dynamic = "force-dynamic";

/**
 * Demo pública. Los datos se generan en el servidor (relativos a hoy) y se
 * entregan al cliente ya serializados, así no hay desajuste de hidratación con
 * fechas calculadas dos veces. Nada de lo que se añada aquí se guarda.
 */
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <JournalProvider mode="demo" basePath="/demo" initialExperiences={createDemoExperiences()}>
      {children}
    </JournalProvider>
  );
}
