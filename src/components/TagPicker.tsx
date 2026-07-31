"use client";

import { useMemo, useState } from "react";
import { MORE_CLAMP_KEY, useWrapClamp } from "./useWrapClamp";
import { normalize } from "@/lib/emotions";
import { TAG_COLOR, TAG_HINT, TAG_LABEL, TAG_PLACEHOLDER } from "@/lib/tags";
import type { TagKind } from "@/lib/types";

const CHIP_CLASS = "rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap";

interface PickerChip {
  key: string;
  label: string;
  isNew: boolean;
}

/**
 * Selector de etiquetas libres (áreas e involucrados) del formulario: mismo
 * comportamiento que el de emociones pero sin nivel. Lo elegido se muestra
 * arriba y se quita con la ×; debajo, lo que queda por elegir, recortado a 4
 * filas y sin scroll.
 */
export function TagPicker({
  kind,
  catalog,
  value,
  onChange,
  required = false,
}: {
  kind: TagKind;
  /** Catálogo que se ofrece: base del tipo más lo ya usado en el diario. */
  catalog: string[];
  value: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
}) {
  const [query, setQuery] = useState("");
  const color = TAG_COLOR[kind];

  const selectedKeys = useMemo(() => new Set(value.map(normalize)), [value]);

  const trimmed = query.trim();
  const canCreate =
    trimmed.length > 1 &&
    !catalog.some((name) => normalize(name) === normalize(trimmed)) &&
    !selectedKeys.has(normalize(trimmed));

  // El chip de crear va primero, para que quede visible sin desplegar nada
  // mientras se escribe algo que aún no existe.
  const chips = useMemo<PickerChip[]>(() => {
    const q = normalize(query);
    const items: PickerChip[] = [];
    if (canCreate) items.push({ key: `crear:${normalize(trimmed)}`, label: trimmed, isNew: true });
    for (const name of catalog) {
      const key = normalize(name);
      if (selectedKeys.has(key)) continue;
      if (q && !key.includes(q)) continue;
      items.push({ key, label: name, isNew: false });
    }
    return items;
  }, [catalog, query, trimmed, canCreate, selectedKeys]);

  const { containerRef, measureRef, shown, expanded, needsToggle, toggleExpanded } = useWrapClamp(chips, 4);

  function add(name: string) {
    if (selectedKeys.has(normalize(name))) return;
    onChange([...value, name]);
    setQuery("");
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-xs font-medium tracking-wide text-ink-400 uppercase">
        {TAG_LABEL[kind]}
        {required ? null : <span className="ml-1.5 normal-case opacity-70">(opcional)</span>}
      </legend>
      <p className="-mt-1 text-xs text-ink-400">{TAG_HINT[kind]}</p>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((name) => (
            <span
              key={normalize(name)}
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: `${color}26`, color }}
            >
              {name}
              <button
                type="button"
                aria-label={`Quitar ${name}`}
                onClick={() => onChange(value.filter((n) => normalize(n) !== normalize(name)))}
                className="-mr-0.5 flex h-4 w-4 items-center justify-center rounded-full transition hover:bg-ink-950/30"
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={TAG_PLACEHOLDER[kind]}
        className="rounded-xl border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm outline-none placeholder:text-ink-600 focus:border-ink-400"
      />

      {chips.length > 0 ? (
        <div>
          <div
            ref={measureRef}
            aria-hidden
            className="pointer-events-none fixed top-[-9999px] left-[-9999px] whitespace-nowrap"
          >
            {chips.map((chip) => (
              <button key={chip.key} type="button" data-clamp-key={chip.key} className={CHIP_CLASS} tabIndex={-1}>
                {chip.isNew ? `+ Añadir «${chip.label}»` : chip.label}
              </button>
            ))}
            <button type="button" data-clamp-key={MORE_CLAMP_KEY} className={CHIP_CLASS} tabIndex={-1}>
              Ver más
            </button>
          </div>

          <div ref={containerRef} className="flex flex-wrap gap-1.5">
            {shown.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => add(chip.label)}
                className={chip.isNew ? `${CHIP_CLASS} border-dashed` : `${CHIP_CLASS} transition`}
                style={
                  chip.isNew
                    ? { borderColor: color, color }
                    : { borderColor: "var(--color-ink-700)", color: "var(--color-ink-300)" }
                }
              >
                {chip.isNew ? `+ Añadir «${chip.label}»` : chip.label}
              </button>
            ))}

            {needsToggle ? (
              <button
                type="button"
                onClick={toggleExpanded}
                className={`${CHIP_CLASS} border-dashed border-ink-600 text-ink-300 transition hover:border-ink-400 hover:text-ink-100`}
              >
                {expanded ? "Ver menos" : "Ver más"}
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="py-1.5 text-xs text-ink-600">
          {trimmed ? "Nada que coincida." : "Escribe para añadir."}
        </p>
      )}
    </fieldset>
  );
}
