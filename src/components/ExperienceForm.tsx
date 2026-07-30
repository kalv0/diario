"use client";

import { useEffect, useState } from "react";
import { EmotionPicker } from "./EmotionPicker";
import { useJournal } from "./JournalProvider";
import { ListEditor } from "./ListEditor";
import { Modal, ModalHeader } from "./Modal";
import { toDateTimeLocalValue } from "@/lib/date-filter";
import type { EmotionEntry } from "@/lib/types";

/**
 * Formulario de alta. La fecha y hora vienen rellenas con el momento en que se
 * pulsó el (+); el resto lo pone quien escribe.
 */
export function ExperienceForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addExperience, mode } = useJournal();

  const [occurredAt, setOccurredAt] = useState("");
  const [situation, setSituation] = useState("");
  const [emotions, setEmotions] = useState<EmotionEntry[]>([]);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cada apertura arranca en blanco y con la hora actual.
  useEffect(() => {
    if (!open) return;
    setOccurredAt(toDateTimeLocalValue(new Date()));
    setSituation("");
    setEmotions([]);
    setThoughts([]);
    setActions([]);
    setError(null);
    setSaving(false);
  }, [open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;

    if (!situation.trim()) return setError("Describe qué ha ocurrido.");
    if (emotions.length === 0) return setError("Añade al menos una emoción.");
    const date = new Date(occurredAt);
    if (Number.isNaN(date.getTime())) return setError("Revisa la fecha y la hora.");

    setSaving(true);
    setError(null);
    try {
      await addExperience({
        occurredAt: date.toISOString(),
        situation: situation.trim(),
        emotions,
        thoughts,
        actions,
      });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido guardar.");
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="nueva-situacion" panelClassName="max-w-lg">
      <ModalHeader id="nueva-situacion" title="Nueva situación" onClose={onClose} />

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="thin-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wide text-ink-400 uppercase">Día y hora</span>
            <input
              type="datetime-local"
              value={occurredAt}
              max={toDateTimeLocalValue(new Date(Date.now() + 60_000))}
              onChange={(event) => setOccurredAt(event.target.value)}
              required
              className="rounded-xl border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm outline-none focus:border-ink-400"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wide text-ink-400 uppercase">Situación</span>
            <span className="-mt-1 text-xs text-ink-400">Qué ocurre, con quién estoy, dónde, etc.</span>
            <textarea
              value={situation}
              onChange={(event) => setSituation(event.target.value)}
              rows={4}
              required
              placeholder="Describe la situación…"
              className="resize-y rounded-xl border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm leading-relaxed outline-none placeholder:text-ink-600 focus:border-ink-400"
            />
          </label>

          <EmotionPicker value={emotions} onChange={setEmotions} />

          <ListEditor
            label="Pensamientos"
            hint="Qué se me pasa por la cabeza, qué me digo a mí mismo/a, de los demás o de la situación."
            placeholder="Un pensamiento…"
            items={thoughts}
            onChange={setThoughts}
          />

          <ListEditor
            label="Acciones"
            hint="Cómo actúo ante la situación, qué pasa después, etc."
            placeholder="Una acción…"
            items={actions}
            onChange={setActions}
          />
        </div>

        {/* El área segura la añade el propio panel del modal. */}
        <div className="shrink-0 border-t border-ink-800 bg-ink-900 px-5 py-3">
          {error ? (
            <p role="alert" className="mb-2 rounded-lg border border-neg/40 bg-neg-soft px-3 py-2 text-xs text-neg">
              {error}
            </p>
          ) : null}
          {mode === "demo" ? (
            <p className="mb-2 text-center text-[11px] text-ink-400">
              En la demo nada se guarda: al recargar la página vuelve el diario de ejemplo.
            </p>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-ink-100 px-4 py-3 text-sm font-semibold text-ink-950 transition active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar situación"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
