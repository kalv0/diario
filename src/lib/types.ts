/** Tipos compartidos entre servidor, cliente y demo. */

export type Valence = "POSITIVA" | "NEGATIVA";

/** De dónde nace la emoción de una entrada. */
export type Origin = "EXTERNA" | "INTERNA";

/** Los dos tipos de etiqueta libre de una entrada. */
export type TagKind = "AREA" | "INVOLUCRADO";

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
  /** Descripción: qué pasó. Título de la entrada. */
  description: string;
  emotions: EmotionEntry[];
  /** Áreas de vida. Al menos una en toda entrada nueva o editada. */
  areas: string[];
  /** Con quién o con qué está relacionada. Puede ir vacío. */
  involved: string[];
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
  description: string;
  emotions: EmotionEntry[];
  areas: string[];
  involved: string[];
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
