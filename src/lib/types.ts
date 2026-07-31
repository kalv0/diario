/** Tipos compartidos entre servidor, cliente y demo. */

export type Valence = "POSITIVA" | "NEGATIVA";

/** De dónde nace la emoción de una entrada. */
export type Origin = "EXTERNA" | "INTERNA";

/** Los tres grupos en que se clasifica una entrada. */
export type GroupType = "positivas" | "negativas" | "ambiguas";

export interface EmotionEntry {
  name: string;
  valence: Valence;
  /** Nivel de sentimiento de 0 a 10. */
  level: number;
}

export interface Experience {
  id: string;
  origin: Origin;
  /** ISO 8601. Fecha y hora en que ocurrió. */
  occurredAt: string;
  /** Desencadenante: qué ocurrió o qué pensamiento apareció. Título de la entrada. */
  trigger: string;
  emotions: EmotionEntry[];
  /** Pensamientos relacionados. */
  thoughts: string[];
  /** Respuesta: qué hice, qué tuve ganas de hacer, qué evité hacer. */
  actions: string[];
  /** Reflexión posterior. Cadena vacía si no se escribió. */
  reflection: string;
  createdAt: string;
}

/** Payload del formulario de alta. */
export interface ExperienceInput {
  origin: Origin;
  occurredAt: string;
  trigger: string;
  emotions: EmotionEntry[];
  thoughts: string[];
  actions: string[];
  reflection: string;
}

/** Una burbuja del panel principal. */
export interface Bubble {
  /** Identificador estable: nombre de emoción, o "Positiva + Negativa" en mixtas. */
  key: string;
  label: string;
  /** Nº de entradas que la referencian. Determina el tamaño. */
  count: number;
  group: GroupType;
}
