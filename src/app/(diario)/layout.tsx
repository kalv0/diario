import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listExperiences } from "@/lib/experiences-repo";
import { JournalProvider } from "@/components/JournalProvider";

/**
 * Envoltorio del diario real. Carga las experiencias en el servidor y las
 * entrega al proveedor: el layout no se vuelve a montar al navegar entre
 * páginas hermanas, así que el filtro de fechas se mantiene de una a otra.
 */
export default async function DiarioLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const experiences = await listExperiences(user.id);

  return (
    <JournalProvider
      mode="api"
      basePath=""
      username={user.displayName ?? user.username}
      initialExperiences={experiences}
    >
      {children}
    </JournalProvider>
  );
}
