"use client";

import { useEffect } from "react";

/**
 * Capa modal básica: fondo oscuro, cierre con Escape o tocando fuera y bloqueo
 * del scroll del documento mientras está abierta. En móvil el panel se pega
 * abajo (hoja) y en pantallas grandes se centra.
 */
export function Modal({
  open,
  onClose,
  labelledBy,
  children,
  align = "center",
  panelClassName = "",
}: {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  children: React.ReactNode;
  align?: "center" | "sheet";
  panelClassName?: string;
}) {
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

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className={[
        "fixed inset-0 z-50 flex animate-fade-in justify-center bg-black/70 backdrop-blur-sm",
        align === "sheet" ? "items-end sm:items-center" : "items-center",
      ].join(" ")}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={[
          "animate-pop-in w-full overflow-hidden border border-ink-700 bg-ink-900 shadow-2xl shadow-black/60",
          align === "sheet" ? "rounded-t-3xl sm:rounded-3xl" : "rounded-3xl",
          panelClassName || "max-w-lg",
        ].join(" ")}
        style={{ paddingBottom: align === "sheet" ? "var(--safe-bottom)" : undefined }}
      >
        {children}
      </div>
    </div>
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
    <div className="flex items-center justify-between gap-3 border-b border-ink-800 px-5 py-4">
      <h2 id={id} className="text-base font-semibold">
        {title}
      </h2>
      <div className="flex items-center gap-1">
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
