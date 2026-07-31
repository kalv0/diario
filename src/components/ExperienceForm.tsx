"use client";

import { useEffect, useState } from "react";
import { EmotionPicker } from "./EmotionPicker";
import { useJournal } from "./JournalProvider";
import { ListEditor } from "./ListEditor";
import { TagPicker } from "./TagPicker";
import { Modal, ModalHeader } from "./Modal";
import { toDateTimeLocalValue } from "@/lib/date-filter";
import { ORIGIN_HINT, ORIGIN_ICON, ORIGIN_LABEL, ORIGINS } from "@/lib/origin";
import type { EmotionEntry, Experience, Origin } from "@/lib/types";

/**
 * Formulario de una entrada del diario, el mismo para crear y para editar: si
 * fueran dos, cualquier campo nuevo habría que añadirlo en los dos sitios.
 * Con `experience` entra en modo edición, precargado con lo que hay guardado.
 *
 * Lo primero que pregunta es el origen de la emoción, porque cambia cómo se lee
 * todo lo demás: no es igual describir algo que pasó fuera que un pensamiento
 * que apareció solo.
 */
export function ExperienceForm({
  open,
  onClose,
  experience = null,
}: {
  open: boolean;
  onClose: () => void;
  /** Entrada a editar. Sin ella, el formulario da de alta una nueva. */
  experience?: Experience | null;
}) {
  const { addExperience, updateExperience, deleteExperience, tagCatalog, mode } = useJournal();
  const editing = experience !== null;

  const [origin, setOrigin] = useState<Origin | null>(null);
  const [occurredAt, setOccurredAt] = useState("");
  const [description, setDescription] = useState("");
  const [emotions, setEmotions] = useState<EmotionEntry[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [involved, setInvolved] = useState<string[]>([]);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** El borrado pide confirmación en el propio pie, sin apilar otro popup. */
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Al abrir: en alta, todo en blanco y con la hora actual; en edición, los
  // valores guardados.
  useEffect(() => {
    if (!open) return;
    setOrigin(experience?.origin ?? null);
    setOccurredAt(toDateTimeLocalValue(experience ? new Date(experience.occurredAt) : new Date()));
    setDescription(experience?.description ?? "");
    setEmotions(experience ? experience.emotions.map((e) => ({ ...e })) : []);
    setAreas(experience ? [...experience.areas] : []);
    setInvolved(experience ? [...experience.involved] : []);
    setThoughts(experience ? [...experience.thoughts] : []);
    setActions(experience ? [...experience.actions] : []);
    setReflection(experience?.reflection ?? "");
    setError(null);
    setSaving(false);
    setConfirmingDelete(false);
    setDeleting(false);
  }, [open, experience]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (saving || deleting) return;

    if (!origin) return setError("Elige de dónde nace la emoción.");
    if (!description.trim()) return setError("Escribe qué pasó.");
    if (emotions.length === 0) return setError("Añade al menos una emoción.");
    if (areas.length === 0) return setError("Elige al menos un área.");
    const date = new Date(occurredAt);
    if (Number.isNaN(date.getTime())) return setError("Revisa la fecha y la hora.");

    const input = {
      origin,
      occurredAt: date.toISOString(),
      description: description.trim(),
      emotions,
      areas,
      involved,
      thoughts,
      actions,
      reflection: reflection.trim(),
    };

    setSaving(true);
    setError(null);
    try {
      if (experience) await updateExperience(experience.id, input);
      else await addExperience(input);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido guardar.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!experience || deleting) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteExperience(experience.id);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se ha podido eliminar.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  const titleId = editing ? "editar-entrada" : "nueva-entrada";

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} panelClassName="max-w-lg">
      <ModalHeader id={titleId} title={editing ? "Editar entrada" : "Nueva entrada"} onClose={onClose} />

      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="thin-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
          <fieldset className="flex flex-col gap-1.5">
            <legend className="text-xs font-medium tracking-wide text-ink-400 uppercase">Origen</legend>
            <span className="text-xs text-ink-400">¿Qué inició esta entrada?</span>
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
            <span className="text-xs font-medium tracking-wide text-ink-400 uppercase">Descripción</span>
            <span className="-mt-1 text-xs text-ink-400">¿Qué pasó?</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              required
              placeholder="Describe qué pasó…"
              className="resize-y rounded-xl border border-ink-700 bg-ink-850 px-3 py-2.5 text-sm leading-relaxed outline-none placeholder:text-ink-600 focus:border-ink-400"
            />
          </label>

          <EmotionPicker value={emotions} onChange={setEmotions} />

          <TagPicker kind="AREA" catalog={tagCatalog.AREA} value={areas} onChange={setAreas} required />

          <TagPicker
            kind="INVOLUCRADO"
            catalog={tagCatalog.INVOLUCRADO}
            value={involved}
            onChange={setInvolved}
          />

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
            disabled={saving || deleting}
            className="w-full rounded-2xl bg-ink-100 px-4 py-3 text-sm font-semibold text-ink-950 transition active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? "Guardando…" : editing ? "Guardar cambios" : "Guardar entrada"}
          </button>

          {editing ? (
            confirmingDelete ? (
              <div className="mt-2 rounded-2xl border border-neg/40 bg-neg-soft px-3 py-2.5">
                <p className="mb-2 text-center text-xs text-ink-100">
                  Se borrará esta entrada con sus emociones, pensamientos y respuesta. No se puede
                  deshacer.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    disabled={deleting}
                    className="flex-1 rounded-xl border border-ink-600 px-3 py-2 text-sm font-medium text-ink-100 transition disabled:opacity-60"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 rounded-xl bg-neg px-3 py-2 text-sm font-semibold text-ink-950 transition active:scale-[0.98] disabled:opacity-60"
                  >
                    {deleting ? "Eliminando…" : "Sí, eliminar"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                disabled={saving}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-neg/40 px-4 py-2.5 text-sm font-medium text-neg transition active:scale-[0.98] disabled:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path
                    d="M4 7h16M10 4h4a1 1 0 011 1v2H9V5a1 1 0 011-1zM6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M10 11v6M14 11v6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Eliminar entrada
              </button>
            )
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
