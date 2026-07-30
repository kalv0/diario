"use client";

import { useEffect } from "react";
import { Modal, ModalHeader } from "./Modal";
import { formatDateTime } from "@/lib/date-filter";
import { GROUP_COLOR, GROUP_SINGULAR } from "@/lib/emotions";
import { classify } from "@/lib/journal";
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
}: {
  experiences: Experience[];
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
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
    <Modal open onClose={onClose} align="sheet" labelledBy="detalle-experiencia" panelClassName="max-w-lg">
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

      <div className="thin-scrollbar max-h-[72dvh] overflow-y-auto px-5 py-4">
        <p className="mb-4 flex items-center gap-2 text-xs text-ink-400">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-hidden />
          {formatDateTime(experience.occurredAt)}
        </p>

        <Section title="Situación">
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink-100">{experience.situation}</p>
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
          <Section title="Pensamientos">
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
          <Section title="Acciones">
            <ul className="flex flex-col gap-1.5">
              {experience.actions.map((action, i) => (
                <li key={`${i}-${action}`} className="rounded-xl border border-ink-800 bg-ink-850 px-3 py-2.5 text-sm leading-snug">
                  {action}
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
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
