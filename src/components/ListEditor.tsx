"use client";

import { useState } from "react";

/**
 * Editor de listas en formato tarjeta (pensamientos y acciones). Cada elemento
 * es una card independiente que se puede borrar; el orden es el de entrada.
 */
export function ListEditor({
  label,
  hint,
  placeholder,
  items,
  onChange,
}: {
  label: string;
  hint: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const value = draft.trim();
    if (!value) return;
    onChange([...items, value]);
    setDraft("");
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-xs font-medium tracking-wide text-ink-400 uppercase">{label}</legend>
      <p className="-mt-1 text-xs text-ink-400">{hint}</p>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {items.map((item, index) => (
            <li
              key={`${index}-${item}`}
              className="flex items-start gap-2 rounded-xl border border-ink-700 bg-ink-850 px-3 py-2.5"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-600" aria-hidden />
              <span className="flex-1 text-sm leading-snug break-words">{item}</span>
              <button
                type="button"
                aria-label={`Quitar «${item}»`}
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="-mt-0.5 -mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-400 transition hover:bg-ink-800 hover:text-neg"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-xl border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm outline-none placeholder:text-ink-600 focus:border-ink-400"
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim()}
          className="shrink-0 rounded-xl border border-ink-700 bg-ink-800 px-3.5 text-sm font-medium text-ink-100 transition disabled:opacity-30"
        >
          Añadir
        </button>
      </div>
    </fieldset>
  );
}
