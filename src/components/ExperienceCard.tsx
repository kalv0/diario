"use client";

import { formatShort, formatTime } from "@/lib/date-filter";
import { GROUP_COLOR } from "@/lib/emotions";
import { classify, maxLevel } from "@/lib/journal";
import { ORIGIN_ICON, ORIGIN_LABEL } from "@/lib/origin";
import { TAG_COLOR } from "@/lib/tags";
import type { Experience } from "@/lib/types";

/** Tarjeta resumen del listado. Al pulsarla se abre el detalle completo. */
export function ExperienceCard({ experience, onOpen }: { experience: Experience; onOpen: () => void }) {
  const group = classify(experience);
  const color = GROUP_COLOR[group];
  const date = new Date(experience.occurredAt);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-2xl border border-ink-800 bg-ink-900/70 p-3.5 text-left transition active:scale-[0.99] hover:border-ink-700"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
        <span
          className="text-sm leading-none"
          title={ORIGIN_LABEL[experience.origin]}
          aria-label={ORIGIN_LABEL[experience.origin]}
        >
          {ORIGIN_ICON[experience.origin]}
        </span>
        <span className="text-xs font-medium text-ink-400">
          {formatShort(date)} · {formatTime(date)}
        </span>
        <span className="ml-auto text-xs font-semibold tabular-nums" style={{ color }}>
          {maxLevel(experience)}/10
        </span>
      </div>

      <p className="line-clamp-3 text-sm leading-snug text-ink-100">{experience.description}</p>

      {experience.areas.length > 0 || experience.involved.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {experience.areas.map((name) => (
            <span
              key={`a-${name}`}
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: `${TAG_COLOR.AREA}1f`, color: TAG_COLOR.AREA }}
            >
              {name}
            </span>
          ))}
          {experience.involved.map((name) => (
            <span
              key={`i-${name}`}
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: `${TAG_COLOR.INVOLUCRADO}1f`, color: TAG_COLOR.INVOLUCRADO }}
            >
              {name}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {experience.emotions.map((emotion) => {
          const emotionColor = emotion.valence === "POSITIVA" ? GROUP_COLOR.positivas : GROUP_COLOR.negativas;
          return (
            <span
              key={`${emotion.name}-${emotion.level}`}
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: `${emotionColor}1f`, color: emotionColor }}
            >
              {emotion.name} {emotion.level}
            </span>
          );
        })}
      </div>

      {experience.thoughts.length > 0 || experience.actions.length > 0 || experience.reflection ? (
        <div className="mt-2.5 flex gap-3 text-[11px] text-ink-400">
          {experience.thoughts.length > 0 ? (
            <span>
              {experience.thoughts.length} {experience.thoughts.length === 1 ? "pensamiento" : "pensamientos"}
            </span>
          ) : null}
          {experience.actions.length > 0 ? (
            <span>
              {experience.actions.length} {experience.actions.length === 1 ? "respuesta" : "respuestas"}
            </span>
          ) : null}
          {experience.reflection ? <span>con reflexión</span> : null}
        </div>
      ) : null}
    </button>
  );
}
