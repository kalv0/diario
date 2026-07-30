"use client";

import Link from "next/link";
import { useHref } from "./JournalProvider";

/**
 * Bloque de acciones de la vista principal: el (+) protagonista y, justo
 * debajo, los accesos al listado completo y a la línea de tiempo. Va fijo
 * abajo y centrado, siempre en el mismo sitio.
 */
export function MainActions({ onAdd }: { onAdd: () => void }) {
  const href = useHref();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-20 flex flex-col items-center gap-2.5"
      style={{ bottom: "calc(1rem + var(--safe-bottom))" }}
    >
      <button
        type="button"
        onClick={onAdd}
        aria-label="Añadir nueva situación"
        className="pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink-100 text-ink-950 shadow-xl shadow-black/50 ring-4 ring-ink-950/70 transition active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </button>

      <div className="pointer-events-auto flex items-center gap-2">
        <Link
          href={href("/experiencias")}
          className="flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-900/90 px-3.5 py-2 text-xs font-medium text-ink-300 backdrop-blur transition active:scale-95 hover:text-ink-100"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
          </svg>
          Experiencias
        </Link>
        <Link
          href={href("/linea-tiempo")}
          className="flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-900/90 px-3.5 py-2 text-xs font-medium text-ink-300 backdrop-blur transition active:scale-95 hover:text-ink-100"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M7 12V7M11 12v-3M15 12v5M19 12v-2" strokeLinecap="round" />
          </svg>
          Línea de tiempo
        </Link>
      </div>
    </div>
  );
}
