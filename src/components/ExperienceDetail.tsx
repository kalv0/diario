"use client";

import { useEffect } from "react";
import { Modal, ModalHeader } from "./Modal";
import { formatDateTime } from "@/lib/date-filter";
import { GROUP_COLOR, GROUP_SINGULAR } from "@/lib/emotions";
import { classify } from "@/lib/journal";
import { ORIGIN_ICON, ORIGIN_LABEL } from "@/lib/origin";
import type { Experience } from "@/lib/types";

/**
 * Detalle completo de una experiencia. Las flechas laterales recorren la lista
 * en el mismo orden en que se está viendo detrás.
 */
export function ExperienceDetail({
  experiences,
  index,
  onIndexChange,
  onClose,
  onEdit,
}: {
  experiences: Experience[];
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  onEdit: (experience: Experience) => void;
}) {
  const open = index !== null && index >= 0 && index < experiences.length;
  const experience = open ? experiences[index] : null;
  const hasPrev = open && index > 0;
  const hasNext = open && index < experiences.length - 1;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && hasPrev) onIndexChange(index - 1);
      if (event.key === "ArrowRight" && hasNext) onIndexChange(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, hasPrev, hasNext, onIndexChange]);

  if (!open || !experience) return null;

  const group = classify(experience);
  const color = GROUP_COLOR[group];

  return (
    <Modal open onClose={onClose} variant="full" labelledBy="detalle-experiencia" panelClassName="max-w-lg">
      <ModalHeader
        id="detalle-experiencia"
        title={GROUP_SINGULAR[group]}
        onClose={onClose}
        right={
          <div className="mr-1 flex items-center gap-1">
            <button
              type="button"
              aria-label="Experiencia anterior"
              disabled={!hasPrev}
              onClick={() => onIndexChange(index - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-300 transition enabled:hover:bg-ink-800 disabled:opacity-25"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="min-w-12 text-center text-[11px] text-ink-400 tabular-nums">
              {index + 1}/{experiences.length}
            </span>
            <button
              type="button"
              aria-label="Experiencia siguiente"
              disabled={!hasNext}
              onClick={() => onIndexChange(index + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-300 transition enabled:hover:bg-ink-800 disabled:opacity-25"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        }
      />

      <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-400">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden />
            {formatDateTime(experience.occurredAt)}
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-ink-700 px-2 py-0.5">
            <span aria-hidden>{ORIGIN_ICON[experience.origin]}</span>
            {ORIGIN_LABEL[experience.origin]}
          </span>
        </div>

        <Section title="Desencadenante">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink-100">{experience.trigger}</p>
        </Section>

        <Section title="Emociones">
          <ul className="flex flex-col gap-2">
            {experience.emotions.map((emotion) => {
              const emotionColor = emotion.valence === "POSITIVA" ? GROUP_COLOR.positivas : GROUP_COLOR.negativas;
              return (
                <li key={`${emotion.name}-${emotion.level}`} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-sm" style={{ color: emotionColor }}>
                    {emotion.name}
                  </span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-800">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${emotion.level * 10}%`, backgroundColor: emotionColor }}
                    />
                  </span>
                  <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-ink-300">
                    {emotion.level}/10
                  </span>
                </li>
              );
            })}
          </ul>
        </Section>

        {experience.thoughts.length > 0 ? (
          <Section title="Pensamientos relacionados">
            <ul className="flex flex-col gap-1.5">
              {experience.thoughts.map((thought, i) => (
                <li key={`${i}-${thought}`} className="rounded-xl border border-ink-800 bg-ink-850 px-3 py-2.5 text-sm leading-snug">
                  {thought}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {experience.actions.length > 0 ? (
          <Section title="Respuesta">
            <ul className="flex flex-col gap-1.5">
              {experience.actions.map((action, i) => (
                <li key={`${i}-${action}`} className="rounded-xl border border-ink-800 bg-ink-850 px-3 py-2.5 text-sm leading-snug">
                  {action}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}

        {experience.reflection ? (
          <Section title="Reflexión posterior">
            <p className="rounded-xl border border-ink-800 bg-ink-850 px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-ink-100">
              {experience.reflection}
            </p>
          </Section>
        ) : null}
      </div>

      {/* Fuera del bloque desplazable: la edición debe estar siempre a la vista,
          sin obligar a bajar hasta el final de una entrada larga. */}
      <div
        className="shrink-0 border-t border-ink-800 bg-ink-900 px-5 py-3"
        style={{ paddingBottom: "0.75rem" }}
      >
        <button
          type="button"
          onClick={() => onEdit(experience)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-ink-700 px-4 py-2.5 text-sm font-medium text-ink-100 transition active:scale-[0.98] hover:border-ink-500"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path
              d="M4 20h4l10.5-10.5a2.12 2.12 0 00-3-3L5 17v3z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M13.5 6.5l4 4" strokeLinecap="round" />
          </svg>
          Editar entrada
        </button>
      </div>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5 last:mb-0">
      <h3 className="mb-2 text-xs font-medium tracking-wide text-ink-400 uppercase">{title}</h3>
      {children}
    </section>
  );
}
