"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Capa modal: fondo oscuro, cierre con Escape o tocando fuera y bloqueo del
 * scroll del documento mientras está abierta.
 *
 * Se pinta con un portal sobre <body> y no donde se declara. Es obligatorio:
 * la cabecera lleva `backdrop-blur`, y un `backdrop-filter` convierte al
 * elemento en bloque contenedor de sus descendientes `position: fixed`. Sin el
 * portal, los popups que salen de la cabecera se posicionan respecto a ella
 * —sesenta píxeles de alto— y se salen de la pantalla por arriba.
 *
 * Variantes:
 * - `center`: tarjeta centrada en pantalla, con margen alrededor.
 * - `full`: pantalla completa en móvil, tarjeta centrada a partir de `sm`.
 *
 * En las dos, el panel nunca supera el alto disponible. Los hijos se colocan
 * en columna, así que el bloque que deba desplazarse necesita
 * `flex-1 min-h-0 overflow-y-auto`.
 */
export function Modal({
  open,
  onClose,
  labelledBy,
  children,
  variant = "center",
  panelClassName = "",
}: {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  children: React.ReactNode;
  variant?: "center" | "full";
  panelClassName?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const isFull = variant === "full";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className={[
        "fixed inset-0 z-50 flex animate-fade-in justify-center bg-black/70 backdrop-blur-sm",
        isFull ? "items-stretch sm:items-center sm:p-4" : "items-center p-4",
      ].join(" ")}
      style={
        isFull
          ? undefined
          : {
              // Márgenes que respetan el notch y la barra inferior del móvil.
              paddingTop: "calc(1rem + var(--safe-top))",
              paddingBottom: "calc(1rem + var(--safe-bottom))",
            }
      }
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={[
          "animate-pop-in flex w-full flex-col overflow-hidden border-ink-700 bg-ink-900 shadow-2xl shadow-black/60",
          isFull
            ? "h-dvh sm:h-auto sm:max-h-full sm:rounded-3xl sm:border"
            : "max-h-full rounded-3xl border",
          panelClassName || "max-w-lg",
        ].join(" ")}
        style={isFull ? { paddingBottom: "var(--safe-bottom)", paddingTop: "var(--safe-top)" } : undefined}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function ModalHeader({
  title,
  id,
  onClose,
  right,
}: {
  title: string;
  id?: string;
  onClose: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ink-800 px-5 py-4">
      <h2 id={id} className="truncate text-base font-semibold">
        {title}
      </h2>
      <div className="flex shrink-0 items-center gap-1">
        {right}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-400 transition hover:bg-ink-800 hover:text-ink-100"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
