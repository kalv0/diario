/**
 * Filtro de fechas global (la barra de arriba). Afecta a la vista de burbujas,
 * al listado de entradas, a la línea de tiempo y a las páginas de grupo.
 *
 * Todo el cálculo se hace en hora local: las claves de día son "YYYY-MM-DD"
 * construidas a partir de getFullYear/getMonth/getDate, nunca con toISOString(),
 * para que un registro de las 00:30 no se cuente en el día anterior.
 */

export type DatePreset = "hoy" | "7d" | "30d" | "siempre";

export type DateFilter =
  | { kind: "preset"; preset: DatePreset }
  /** Día concreto (from === to) o rango cerrado. Claves "YYYY-MM-DD". */
  | { kind: "custom"; from: string; to: string };

export const DEFAULT_FILTER: DateFilter = { kind: "preset", preset: "30d" };

export const PRESET_LABEL: Record<DatePreset, string> = {
  hoy: "Hoy",
  "7d": "7 días",
  "30d": "30 días",
  siempre: "Siempre",
};

/* -------------------------------------------------------------------------- */
/* Utilidades de día                                                           */
/* -------------------------------------------------------------------------- */

export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "YYYY-MM-DD" -> Date a las 00:00:00.000 locales. */
export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

/** Primer día del mes, útil como identidad de "mes visible" en el calendario. */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isBeforeMonth(a: Date, b: Date): boolean {
  return a.getFullYear() < b.getFullYear() || (a.getFullYear() === b.getFullYear() && a.getMonth() < b.getMonth());
}

/* -------------------------------------------------------------------------- */
/* Resolución del filtro a un rango [from, to]                                 */
/* -------------------------------------------------------------------------- */

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * `earliest` es la fecha del registro más antiguo del diario. Solo lo usa el
 * preset «Siempre», que arranca ahí en vez de en una fecha arbitraria: la
 * línea de tiempo recorre el rango día a día, así que empezar en 1970 la
 * dejaría recorriendo décadas vacías hasta chocar con su tope.
 */
export function resolveRange(filter: DateFilter, now: Date = new Date(), earliest: Date | null = null): DateRange {
  if (filter.kind === "custom") {
    return { from: startOfDay(parseDayKey(filter.from)), to: endOfDay(parseDayKey(filter.to)) };
  }
  const to = endOfDay(now);
  switch (filter.preset) {
    case "hoy":
      return { from: startOfDay(now), to };
    case "7d":
      return { from: startOfDay(addDays(now, -6)), to };
    case "siempre":
      return { from: startOfDay(earliest ?? now), to };
    case "30d":
    default:
      return { from: startOfDay(addDays(now, -29)), to };
  }
}

/** Lista de claves de día que cubre un rango, ambos extremos incluidos. */
export function eachDayKey(range: DateRange): string[] {
  const keys: string[] = [];
  const cursor = startOfDay(range.from);
  const last = startOfDay(range.to);
  // Tope de seguridad: 10 años de días.
  let guard = 0;
  while (cursor <= last && guard++ < 3700) {
    keys.push(dayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

/* -------------------------------------------------------------------------- */
/* Formato                                                                     */
/* -------------------------------------------------------------------------- */

const shortDate = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short" });
const longDate = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const timeOnly = new Intl.DateTimeFormat("es-ES", { hour: "2-digit", minute: "2-digit" });
const monthYear = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });

export function formatShort(date: Date): string {
  return shortDate.format(date).replace(".", "");
}

export function formatLong(date: Date): string {
  return longDate.format(date);
}

export function formatTime(date: Date): string {
  return timeOnly.format(date);
}

export function formatMonthYear(date: Date): string {
  const text = monthYear.format(date);
  return text.charAt(0).toLocaleUpperCase("es") + text.slice(1);
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${formatLong(d)} · ${formatTime(d)}`;
}

/** Etiqueta corta del filtro para la barra superior. */
export function filterLabel(filter: DateFilter): string {
  if (filter.kind === "preset") return PRESET_LABEL[filter.preset];
  if (filter.from === filter.to) return formatShort(parseDayKey(filter.from));
  return `${formatShort(parseDayKey(filter.from))} – ${formatShort(parseDayKey(filter.to))}`;
}

/**
 * Mes en el que debe abrirse el calendario:
 * - sin fecha personalizada -> mes actual
 * - día concreto -> su mes
 * - rango -> el mes de la fecha final
 */
export function calendarInitialMonth(filter: DateFilter, now: Date = new Date()): Date {
  if (filter.kind === "custom") return startOfMonth(parseDayKey(filter.to));
  return startOfMonth(now);
}

/** Valor del input datetime-local para una fecha dada. */
export function toDateTimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}
