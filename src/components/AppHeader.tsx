"use client";

import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/login/actions";
import { DateFilterBar } from "./DateFilterBar";
import { DemoAccountCta } from "./DemoAccountCta";
import { useJournal } from "./JournalProvider";

/**
 * Cabecera común: atrás a la izquierda, selector de fechas centrado (es el
 * filtro global) y salir/demo a la derecha.
 */
export function AppHeader({ backHref }: { backHref?: string }) {
  const { mode } = useJournal();
  const router = useRouter();

  return (
    <header
      className="sticky top-0 z-30 grid grid-cols-[minmax(2.5rem,1fr)_auto_minmax(2.5rem,1fr)] items-center gap-2 border-b border-ink-800/80 bg-ink-950/85 px-2 py-2.5 backdrop-blur-md"
      style={{ paddingTop: "calc(0.625rem + var(--safe-top))" }}
    >
      <div className="flex justify-start">
        {backHref ? (
          <button
            type="button"
            aria-label="Volver"
            onClick={() => router.push(backHref)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-300 transition hover:bg-ink-800 hover:text-ink-100"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : null}
      </div>

      <div className="flex justify-center">
        <DateFilterBar />
      </div>

      <div className="flex justify-end">
        {mode === "demo" ? (
          <DemoAccountCta />
        ) : (
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-400 transition hover:bg-ink-800 hover:text-ink-100"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 17l5-5-5-5M20 12H9M12 3H6a2 2 0 00-2 2v14a2 2 0 002 2h6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
