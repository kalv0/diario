"use client";

import Link from "next/link";
import { useState } from "react";
import { Modal } from "./Modal";

export const ADMIN_EMAIL = "raul@calvo.cc";

/**
 * CTA discreto de la demo. Abre un popup explicando que las cuentas las da el
 * administrador por correo; no hay registro automático.
 */
export function DemoAccountCta() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(ADMIN_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-ink-700 px-3 py-1.5 text-[11px] font-medium text-ink-300 transition hover:border-ink-500 hover:text-ink-100"
      >
        Obtener cuenta
      </button>

      <Modal open={open} onClose={() => setOpen(false)} align="sheet" panelClassName="max-w-sm">
        <div className="px-6 pt-7 pb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink-800 text-ink-100">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="M4 7l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h2 className="text-lg font-semibold">Obtener una cuenta</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-300">
            Las cuentas del diario las da el administrador de la web. Escríbele y te la crea:
          </p>

          <a
            href={`mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent("Cuenta para el diario de situaciones")}`}
            className="mt-4 block rounded-2xl bg-ink-100 px-4 py-3 text-sm font-semibold break-all text-ink-950 transition active:scale-[0.98]"
          >
            {ADMIN_EMAIL}
          </a>

          <button
            type="button"
            onClick={copyEmail}
            className="mt-2 w-full rounded-2xl border border-ink-700 px-4 py-2.5 text-sm text-ink-300 transition hover:text-ink-100"
          >
            {copied ? "Copiado ✓" : "Copiar dirección"}
          </button>

          <p className="mt-5 text-xs text-ink-400">
            ¿Ya tienes una?{" "}
            <Link href="/login" className="font-semibold text-ink-100 underline decoration-ink-600 underline-offset-4">
              Entrar
            </Link>
          </p>
        </div>
      </Modal>
    </>
  );
}
