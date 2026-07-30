"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Bubble } from "@/lib/types";

interface Body {
  key: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/** Misma velocidad para todas las burbujas; solo cambia la dirección. */
const SPEED = 20; // px/s

/**
 * Campo de burbujas en movimiento continuo. Rebotan contra los bordes de su
 * zona, todas a la misma velocidad y con dirección inicial aleatoria. El radio
 * depende del número de experiencias asociadas a esa emoción.
 *
 * La animación escribe directamente sobre el DOM (transform) en vez de pasar
 * por el estado de React: con 20-30 burbujas a 60 fps, re-renderizar sería
 * tirar el presupuesto de la batería del móvil por la ventana.
 */
export function BubbleField({ bubbles, color }: { bubbles: Bubble[]; color: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const bodiesRef = useRef<Body[]>([]);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Medida inicial síncrona: ResizeObserver solo entrega su primera
  // notificación cuando el navegador produce un fotograma, y hasta entonces las
  // burbujas tendrían radio cero.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = (width: number, height: number) =>
      setSize((prev) =>
        Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1 ? prev : { width, height },
      );

    const rect = el.getBoundingClientRect();
    measure(rect.width, rect.height);

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      measure(width, height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const radii = useMemo(
    () => computeRadii(bubbles, size.width, size.height),
    [bubbles, size.width, size.height],
  );

  const signature = useMemo(
    () => bubbles.map((b, i) => `${b.key}@${radii[i]?.toFixed(1)}`).join("|"),
    [bubbles, radii],
  );

  // (Re)construye los cuerpos conservando la posición de las burbujas que ya
  // estaban, para que un cambio de filtro no lo reinicie todo de golpe.
  useEffect(() => {
    const { width, height } = size;
    if (width === 0 || height === 0) return;

    const previous = new Map(bodiesRef.current.map((b) => [b.key, b]));
    bodiesRef.current = bubbles.map((bubble, index) => {
      const r = Math.max(8, Math.min(radii[index] ?? 24, width / 2, height / 2));
      const old = previous.get(bubble.key);
      if (old) {
        return {
          ...old,
          r,
          x: clamp(old.x, r, Math.max(r, width - r)),
          y: clamp(old.y, r, Math.max(r, height - r)),
        };
      }
      const angle = Math.random() * Math.PI * 2;
      return {
        key: bubble.key,
        r,
        x: r + Math.random() * Math.max(1, width - 2 * r),
        y: r + Math.random() * Math.max(1, height - 2 * r),
        vx: Math.cos(angle) * SPEED,
        vy: Math.sin(angle) * SPEED,
      };
    });
  }, [signature, bubbles, radii, size]);

  // Bucle de animación.
  useEffect(() => {
    const { width, height } = size;
    if (width === 0 || height === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const paint = () => {
      for (const body of bodiesRef.current) {
        const node = nodesRef.current.get(body.key);
        if (node) node.style.transform = `translate3d(${body.x - body.r}px, ${body.y - body.r}px, 0)`;
      }
    };

    // Coloca las burbujas ya, sin esperar al primer fotograma.
    paint();
    if (reduced) return;

    let frame = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;

      for (const body of bodiesRef.current) {
        body.x += body.vx * dt;
        body.y += body.vy * dt;

        if (body.x - body.r <= 0) {
          body.x = body.r;
          body.vx = Math.abs(body.vx);
        } else if (body.x + body.r >= width) {
          body.x = width - body.r;
          body.vx = -Math.abs(body.vx);
        }

        if (body.y - body.r <= 0) {
          body.y = body.r;
          body.vy = Math.abs(body.vy);
        } else if (body.y + body.r >= height) {
          body.y = height - body.r;
          body.vy = -Math.abs(body.vy);
        }
      }

      paint();
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [size, signature]);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden">
      {bubbles.map((bubble, index) => {
        const r = Math.max(8, Math.min(radii[index] ?? 24, size.width / 2 || 24, size.height / 2 || 24));
        const diameter = r * 2;
        const fontSize = Math.max(8, Math.min(13, r * 0.3));
        return (
          <div
            key={bubble.key}
            ref={(node) => {
              if (node) nodesRef.current.set(bubble.key, node);
              else nodesRef.current.delete(bubble.key);
            }}
            title={`${bubble.label} · ${bubble.count}`}
            className="absolute top-0 left-0 flex items-center justify-center rounded-full text-center will-change-transform"
            style={{
              width: diameter,
              height: diameter,
              backgroundColor: `${color}26`,
              border: `1px solid ${color}80`,
              boxShadow: `inset 0 0 ${Math.round(r * 0.6)}px ${color}30`,
              transform: "translate3d(-9999px,-9999px,0)",
            }}
          >
            <span
              className="line-clamp-3 px-1.5 leading-tight font-medium break-words hyphens-auto"
              style={{ fontSize, color, maxWidth: diameter - 6 }}
            >
              {bubble.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Radio de cada burbuja: crece con la raíz del número de experiencias (área
 * proporcional al recuento) y se reescala si entre todas ocupan demasiado.
 */
function computeRadii(bubbles: Bubble[], width: number, height: number): number[] {
  if (width === 0 || height === 0 || bubbles.length === 0) return bubbles.map(() => 0);

  const maxCount = bubbles.reduce((max, b) => Math.max(max, b.count), 1);
  const base = Math.min(width, height);
  const rMax = Math.max(30, Math.min(base * 0.32, 78));
  const rMin = Math.max(22, rMax * 0.45);

  // Área proporcional al recuento (de ahí la raíz), con la burbuja más repetida
  // en el tamaño máximo. Normalizar contra el recuento mínimo en vez de contra
  // cero exageraría la diferencia cuando todo el grupo va de 1 a 2.
  let radii = bubbles.map((b) => Math.max(rMin, rMax * Math.sqrt(b.count / maxCount)));

  // Si el conjunto ocupa más de un tercio de la zona, se encoge todo por igual
  // para que las burbujas no queden apelmazadas.
  const occupied = radii.reduce((sum, r) => sum + Math.PI * r * r, 0);
  const limit = width * height * 0.34;
  if (occupied > limit) {
    const factor = Math.sqrt(limit / occupied);
    radii = radii.map((r) => Math.max(14, r * factor));
  }

  return radii;
}
