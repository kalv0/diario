"use client";

import { useMemo, useState } from "react";
import { useJournal } from "./JournalProvider";
import { GROUP_COLOR, normalize } from "@/lib/emotions";
import type { EmotionEntry, Valence } from "@/lib/types";

const VALENCE_COLOR: Record<Valence, string> = {
  POSITIVA: GROUP_COLOR.positivas,
  NEGATIVA: GROUP_COLOR.negativas,
};

const DEFAULT_LEVEL = 5;

/**
 * Selector de emociones con nivel. Toma el catálogo base más las emociones
 * personalizadas ya usadas, y permite crear una nueva escribiéndola: se guarda
 * con el signo que esté activo en el conmutador.
 */
export function EmotionPicker({
  value,
  onChange,
}: {
  value: EmotionEntry[];
  onChange: (emotions: EmotionEntry[]) => void;
}) {
  const { catalog } = useJournal();
  const [valence, setValence] = useState<Valence>("NEGATIVA");
  const [query, setQuery] = useState("");

  const selectedKeys = useMemo(() => new Set(value.map((e) => normalize(e.name))), [value]);

  const suggestions = useMemo(() => {
    const q = normalize(query);
    return catalog[valence].filter((entry) => !selectedKeys.has(normalize(entry.name)) && (!q || normalize(entry.name).includes(q)));
  }, [catalog, valence, query, selectedKeys]);

  const trimmed = query.trim();
  const canCreate =
    trimmed.length > 1 &&
    !catalog.POSITIVA.some((e) => normalize(e.name) === normalize(trimmed)) &&
    !catalog.NEGATIVA.some((e) => normalize(e.name) === normalize(trimmed)) &&
    !selectedKeys.has(normalize(trimmed));

  function add(name: string, entryValence: Valence) {
    if (selectedKeys.has(normalize(name))) return;
    onChange([...value, { name, valence: entryValence, level: DEFAULT_LEVEL }]);
    setQuery("");
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-xs font-medium tracking-wide text-ink-400 uppercase">Emociones</legend>
      <p className="-mt-1 text-xs text-ink-400">Enfado, tristeza, culpa, alegría… y su nivel de 0 a 10.</p>

      {value.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {value.map((emotion, index) => {
            const color = VALENCE_COLOR[emotion.valence];
            return (
              <li key={normalize(emotion.name)} className="rounded-xl border border-ink-700 bg-ink-850 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
                  <span className="flex-1 truncate text-sm font-medium">{emotion.name}</span>
                  <span
                    className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums"
                    style={{ color }}
                  >
                    {emotion.level}
                  </span>
                  <button
                    type="button"
                    aria-label={`Quitar ${emotion.name}`}
                    onClick={() => onChange(value.filter((_, i) => i !== index))}
                    className="-mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-400 transition hover:bg-ink-800 hover:text-neg"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={emotion.level}
                  aria-label={`Nivel de ${emotion.name}`}
                  style={{ "--range-accent": color } as React.CSSProperties}
                  onChange={(event) => {
                    const level = Number(event.target.value);
                    onChange(value.map((e, i) => (i === index ? { ...e, level } : e)));
                  }}
                  className="mt-1 w-full"
                />
              </li>
            );
          })}
        </ul>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        {(["POSITIVA", "NEGATIVA"] as Valence[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setValence(v)}
            className={[
              "rounded-xl border px-3 py-2 text-sm font-medium transition",
              valence === v ? "text-ink-950" : "border-ink-700 bg-ink-850 text-ink-300",
            ].join(" ")}
            style={valence === v ? { backgroundColor: VALENCE_COLOR[v], borderColor: VALENCE_COLOR[v] } : undefined}
          >
            {v === "POSITIVA" ? "Positivas" : "Negativas"}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar o escribir una emoción nueva…"
        className="rounded-xl border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm outline-none placeholder:text-ink-600 focus:border-ink-400"
      />

      <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto pr-1 thin-scrollbar">
        {canCreate ? (
          <button
            type="button"
            onClick={() => add(trimmed, valence)}
            className="rounded-full border border-dashed px-3 py-1.5 text-xs font-medium"
            style={{ borderColor: VALENCE_COLOR[valence], color: VALENCE_COLOR[valence] }}
          >
            + Añadir «{trimmed}»
          </button>
        ) : null}
        {suggestions.map((entry) => (
          <button
            key={entry.name}
            type="button"
            onClick={() => add(entry.name, entry.valence)}
            className="rounded-full border border-ink-700 bg-ink-850 px-3 py-1.5 text-xs text-ink-300 transition hover:border-ink-500 hover:text-ink-100"
          >
            {entry.name}
          </button>
        ))}
        {suggestions.length === 0 && !canCreate ? (
          <span className="py-1.5 text-xs text-ink-600">No quedan emociones que coincidan.</span>
        ) : null}
      </div>
    </fieldset>
  );
}
