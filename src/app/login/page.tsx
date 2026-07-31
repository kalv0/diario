import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar · Diario de emociones" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center gap-1" aria-hidden>
            <span className="h-6 w-6 rounded-full bg-pos/80" />
            <span className="h-4 w-4 rounded-full bg-mix/80" />
            <span className="h-5 w-5 rounded-full bg-neg/80" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Diario de emociones</h1>
          <p className="mt-2 text-sm text-ink-400">
            Registra qué pasa, qué sientes, qué piensas y qué haces.
          </p>
        </header>

        <LoginForm next={safeNext} />
      </div>
    </main>
  );
}
