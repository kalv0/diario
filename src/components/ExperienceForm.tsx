"use client";

import { useEffect, useState } from "react";
import { EmotionPicker } from "./EmotionPicker";
import { useJournal } from "./JournalProvider";
import { ListEditor } from "./ListEditor";
import { Modal, ModalHeader } from "./Modal";
import { toDateTimeLocalValue } from "@/lib/date-filter";
import { ORIGIN_HINT, ORIGIN_ICON, ORIGIN_LABEL, ORIGIN_TRIGGER_HINT, ORIGINS } from "@/lib/origin";
import type { EmotionEntry, Origin } from "@/lib/types";

/**
 * Formulario de alta de una entrada del diario. Lo primero que pregunta es el
 * origen de la emoción, porque cambia cómo se lee todo lo demás: no es igual
 * describir algo que pasó fuera que un pensamiento que apareció solo.
 */
export function ExperienceForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addExperience, mode } = useJournal();

  const [origin, setOrigin] = useState<Origin | null>(null);
  const [occurredAt, setOccurredAt] = useState("");
  const [trigger, setTrigger] = useState("");
  const [emotions, setEmotions] = useState<EmotionEntry[]>([]);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cada apertura arranca en blanco y con la hora actual.
  useEffect(() => {
    if (!open) return;
    setOrigin(null);
    setOccurredAt(toDateTimeLocalValue(new Date()));
    setTrigger("");
    setEmotions([]);
    setThoughts([]);
    setActions([]);
    setReflection("");
    setError(null);
    setSaving(false);
  }, [open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;

    if (!origin) return setError("Elige de dónde nace la emoción.");
    if (!trigger.trim()) return setError("Escribe el desencadenante.");
    if (emotions.length === 0) return setError("Añade al menos una emoción.");
    const date = new Date(occurredAt);
    if (Number.isNaN(date.getTime())) return setError("Revisa la fecha y la hora.");

    setSaving(true);
    setError(null);
    try {
      await addExperience({
        origin,
        occurredAt: date.toISOString(),
        trigger: trigger.trim(),
        emotions,
        thoughts,
        actions,
        reflection: reflection.trim(),
      });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido guardar.");
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="nueva-entrada" panelClassName="max-w-lg">
      <ModalHeader id="nueva-entrada" title="Nueva entrada" onClose={onClose} />

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="thin-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
          <fieldset className="flex flex-col gap-1.5">
            <legend className="text-xs font-medium tracking-wide text-ink-400 uppercase">Origen</legend>
            <span className="text-xs text-ink-400">¿De dónde nace la emoción?</span>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {ORIGINS.map((value) => {
                const active = origin === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setOrigin(value)}
                    aria-pressed={active}
                    className={[
                      "flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition",
                      active
                        ? "border-ink-100 bg-ink-100 text-ink-950"
                        : "border-ink-700 bg-ink-850 text-ink-300 hover:border-ink-600",
                    ].join(" ")}
                  >
                    <span className="text-base leading-none" aria-hidden>
                      {ORIGIN_ICON[value]}
                    </span>
                    <span className="text-sm font-medium">{ORIGIN_LABEL[value]}</span>
                    <span className={active ? "text-[11px] text-ink-700" : "text-[11px] text-ink-400"}>
                      {ORIGIN_HINT[value]}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

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
            <span className="text-xs font-medium tracking-wide text-ink-400 uppercase">Desencadenante</span>
            <span className="-mt-1 text-xs text-ink-400">
              {origin ? ORIGIN_TRIGGER_HINT[origin] : "Qué ocurrió o qué pensamiento apareció."}
            </span>
            <textarea
              value={trigger}
              onChange={(event) => setTrigger(event.target.value)}
              rows={3}
              required
              placeholder="Describe el desencadenante…"
              className="resize-y rounded-xl border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm leading-relaxed outline-none placeholder:text-ink-600 focus:border-ink-400"
            />
          </label>

          <EmotionPicker value={emotions} onChange={setEmotions} />

          <ListEditor
            label="Pensamientos relacionados"
            hint="Interpretaciones, conclusiones, ideas que aparecieron."
            placeholder="Un pensamiento…"
            items={thoughts}
            onChange={setThoughts}
          />

          <ListEditor
            label="Respuesta"
            hint="Qué hice, qué tuve ganas de hacer, qué evité hacer."
            placeholder="Una respuesta…"
            items={actions}
            onChange={setActions}
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium tracking-wide text-ink-400 uppercase">Reflexión posterior</span>
            <span className="-mt-1 text-xs text-ink-400">Qué ves ahora que no veías en el momento. Opcional.</span>
            <textarea
              value={reflection}
              onChange={(event) => setReflection(event.target.value)}
              rows={3}
              placeholder="Con perspectiva…"
              className="resize-y rounded-xl border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm leading-relaxed outline-none placeholder:text-ink-600 focus:border-ink-400"
            />
          </label>
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
            {saving ? "Guardando…" : "Guardar entrada"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
