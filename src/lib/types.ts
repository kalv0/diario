/** Tipos compartidos entre servidor, cliente y demo. */

export type Valence = "POSITIVA" | "NEGATIVA";

/** Los tres grupos en que se clasifica una situación. */
export type GroupType = "positivas" | "negativas" | "ambiguas";

export interface EmotionEntry {
  name: string;
  valence: Valence;
  /** Nivel de sentimiento de 0 a 10. */
  level: number;
}

export interface Experience {
  id: string;
  /** ISO 8601. Fecha y hora en que ocurrió la situación. */
  occurredAt: string;
  situation: string;
  emotions: EmotionEntry[];
  thoughts: string[];
  actions: string[];
  createdAt: string;
}

/** Payload del formulario de alta. */
export interface ExperienceInput {
  occurredAt: string;
  situation: string;
  emotions: EmotionEntry[];
  thoughts: string[];
  actions: string[];
}

/** Una burbuja del panel principal. */
export interface Bubble {
  /** Identificador estable: nombre de emoción, o "Positiva + Negativa" en mixtas. */
  key: string;
  label: string;
  /** Nº de experiencias que la referencian. Determina el tamaño. */
  count: number;
  group: GroupType;
}
