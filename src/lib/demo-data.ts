import type { Experience, ExperienceInput, Origin } from "./types";

/**
 * Entradas de ejemplo de /demo. Se generan relativas a "hoy" para que siempre
 * caigan dentro del filtro por defecto (últimos 30 días) y la demo nunca se
 * vea vacía. No se guardan en ninguna parte.
 */

interface Seed {
  origin: Origin;
  /** Días hacia atrás desde hoy. */
  daysAgo: number;
  hour: number;
  minute: number;
  trigger: string;
  emotions: Array<[string, "POSITIVA" | "NEGATIVA", number]>;
  areas: string[];
  involved: string[];
  thoughts: string[];
  actions: string[];
  reflection: string;
}

const SEEDS: Seed[] = [
  {
    origin: "EXTERNA",
    daysAgo: 0,
    hour: 9,
    minute: 20,
    trigger: "Reunión de equipo por la mañana. Presento el avance del proyecto delante de todo el departamento.",
    emotions: [
      ["Ansiedad", "NEGATIVA", 6],
      ["Orgullo", "POSITIVA", 7],
    ],
    areas: ["Trabajo"],
    involved: ["Equipo"],
    thoughts: [
      "Van a notar que voy justo de tiempo.",
      "En realidad he sacado más de lo que pedían.",
      "Si me tiembla la voz al principio, luego se me pasa.",
    ],
    actions: [
      "Repaso las notas cinco minutos antes de entrar.",
      "Empiezo hablando despacio y voy cogiendo ritmo.",
      "Al terminar me quedo a resolver dos dudas.",
    ],
    reflection: "La ansiedad venía de anticipar, no de lo que pasó. En cuanto empecé a hablar se fue sola.",
  },
  {
    origin: "EXTERNA",
    daysAgo: 1,
    hour: 21,
    minute: 45,
    trigger: "Cena en casa con mi hermana. Hacía semanas que no nos veíamos con calma.",
    emotions: [
      ["Cariño", "POSITIVA", 9],
      ["Alegría", "POSITIVA", 8],
    ],
    areas: ["Relaciones"],
    involved: ["Hermana"],
    thoughts: ["Esto es lo que echaba de menos.", "Tendríamos que hacerlo más a menudo."],
    actions: ["Cocino sin prisa.", "Dejo el móvil en otra habitación.", "Quedamos para repetir en dos semanas."],
    reflection: "Lo que lo hizo bueno no fue el plan, fue no tener prisa.",
  },
  {
    origin: "EXTERNA",
    daysAgo: 2,
    hour: 17,
    minute: 10,
    trigger: "Discusión con un compañero por un cambio que hizo sin avisar.",
    emotions: [
      ["Enfado", "NEGATIVA", 8],
      ["Frustración", "NEGATIVA", 7],
    ],
    areas: ["Trabajo"],
    involved: ["Compañero de trabajo"],
    thoughts: ["Otra vez lo mismo.", "No me está tomando en serio.", "Si digo algo, va a parecer que exagero."],
    actions: [
      "Contesto en tono seco.",
      "Me levanto a por agua para cortar la conversación.",
      "Le escribo por la tarde para aclararlo.",
    ],
    reflection: "El enfado era proporcionado; el tono seco no. Escribirle después arregló más que la discusión.",
  },
  {
    origin: "EXTERNA",
    daysAgo: 3,
    hour: 7,
    minute: 30,
    trigger: "Salgo a correr al amanecer antes de empezar el día.",
    emotions: [
      ["Calma", "POSITIVA", 8],
      ["Motivación", "POSITIVA", 7],
    ],
    areas: ["Salud", "Desarrollo personal"],
    involved: [],
    thoughts: ["Qué bien sienta madrugar cuando lo consigo."],
    actions: ["Dejo la ropa preparada la noche anterior.", "Hago 6 km sin mirar el reloj."],
    reflection: "",
  },
  {
    origin: "EXTERNA",
    daysAgo: 4,
    hour: 12,
    minute: 0,
    trigger:
      "Llamada del médico con los resultados de una revisión rutinaria. Todo bien, pero he pasado tres días esperando.",
    emotions: [
      ["Alivio", "POSITIVA", 9],
      ["Angustia", "NEGATIVA", 6],
    ],
    areas: ["Salud"],
    involved: ["Médico"],
    thoughts: ["Llevo tres días imaginando lo peor.", "He gastado mucha energía en algo que no controlaba."],
    actions: ["Cuelgo y llamo a casa para contarlo.", "Me tomo la tarde con más calma."],
    reflection: "Tres días de angustia por algo que se resolvió en una llamada de dos minutos.",
  },
  {
    origin: "INTERNA",
    daysAgo: 5,
    hour: 16,
    minute: 40,
    trigger: "Se me cruza la idea de que no encajo del todo en el equipo, sin que haya pasado nada concreto.",
    emotions: [
      ["Inseguridad", "NEGATIVA", 7],
      ["Tristeza", "NEGATIVA", 5],
    ],
    areas: ["Trabajo", "Desarrollo personal"],
    involved: ["Equipo"],
    thoughts: ["Nadie me lo ha dicho, me lo estoy diciendo yo.", "¿De dónde sale esto justo hoy?"],
    actions: ["Lo escribo en vez de darle vueltas.", "Sigo con la tarea que tenía a medias."],
    reflection: "No hubo desencadenante externo. Apareció el pensamiento y detrás vino todo lo demás.",
  },
  {
    origin: "INTERNA",
    daysAgo: 6,
    hour: 23,
    minute: 15,
    trigger: "Ya en la cama, me viene de golpe toda la lista de cosas pendientes de la semana.",
    emotions: [
      ["Ansiedad", "NEGATIVA", 7],
      ["Agobio", "NEGATIVA", 6],
    ],
    areas: ["Desarrollo personal"],
    involved: [],
    thoughts: ["No voy a llegar a todo.", "Mañana voy a estar destrozado."],
    actions: ["Me levanto y apunto todo en una lista.", "Dejo el móvil fuera de la habitación."],
    reflection: "Escrita, la lista era la mitad de larga de lo que parecía en la cabeza.",
  },
  {
    origin: "EXTERNA",
    daysAgo: 8,
    hour: 18,
    minute: 40,
    trigger: "Termino un proyecto en el que llevaba meses atascado y lo entrego.",
    emotions: [
      ["Satisfacción", "POSITIVA", 9],
      ["Alivio", "POSITIVA", 8],
    ],
    areas: ["Trabajo"],
    involved: [],
    thoughts: ["Al final sí era capaz.", "Ha costado más de lo que pensaba, pero está."],
    actions: ["Lo envío y cierro el portátil.", "Me doy la tarde libre sin culpa."],
    reflection: "",
  },
  {
    origin: "EXTERNA",
    daysAgo: 10,
    hour: 15,
    minute: 25,
    trigger: "Me entero por redes de que un grupo de amigos ha quedado y no me han avisado.",
    emotions: [
      ["Tristeza", "NEGATIVA", 7],
      ["Rechazo", "NEGATIVA", 6],
      ["Envidia", "NEGATIVA", 4],
    ],
    areas: ["Relaciones"],
    involved: ["Amigos"],
    thoughts: ["¿He hecho algo mal?", "A lo mejor simplemente se les ha pasado.", "Siempre soy el último en enterarme."],
    actions: ["Cierro la aplicación.", "Le escribo a uno de ellos por privado en vez de dar por hecho lo peor."],
    reflection: "Preguntar costó menos que las dos horas que pasé suponiendo.",
  },
  {
    origin: "EXTERNA",
    daysAgo: 12,
    hour: 11,
    minute: 5,
    trigger: "Digo que no a un encargo extra que no me cabía en la semana.",
    emotions: [
      ["Culpa", "NEGATIVA", 6],
      ["Orgullo", "POSITIVA", 7],
      ["Seguridad", "POSITIVA", 5],
    ],
    areas: ["Trabajo"],
    involved: ["Jefe"],
    thoughts: ["Van a pensar que no tengo ganas.", "Es la primera vez que lo digo sin dar mil explicaciones."],
    actions: ["Contesto por escrito y en dos líneas.", "Propongo una fecha alternativa."],
    reflection: "La culpa duró una hora. El alivio, toda la semana.",
  },
  {
    origin: "INTERNA",
    daysAgo: 15,
    hour: 20,
    minute: 30,
    trigger: "Aparece la idea de que estoy desaprovechando el tiempo libre viendo series.",
    emotions: [
      ["Aburrimiento", "NEGATIVA", 5],
      ["Culpa", "NEGATIVA", 4],
    ],
    areas: ["Desarrollo personal"],
    involved: [],
    thoughts: ["Debería estar haciendo algo productivo.", "Tampoco pasa nada por descansar."],
    actions: ["Salgo a dar una vuelta de veinte minutos.", "Vuelvo y termino el capítulo sin darle más vueltas."],
    reflection: "Descansar no necesitaba justificación. El problema era el juicio, no la tarde.",
  },
  {
    origin: "EXTERNA",
    daysAgo: 18,
    hour: 10,
    minute: 0,
    trigger: "Comida familiar por el cumpleaños de mi madre. Mucha gente y conversación cruzada.",
    emotions: [
      ["Cariño", "POSITIVA", 8],
      ["Agobio", "NEGATIVA", 5],
    ],
    areas: ["Relaciones"],
    involved: ["Madre", "Familia"],
    thoughts: ["Me alegro de verlos a todos.", "Necesito un rato a solas para recargar."],
    actions: ["Salgo diez minutos al balcón.", "Vuelvo y me siento en la punta de la mesa, más tranquilo."],
    reflection: "Puedo querer estar y necesitar irme un rato a la vez. No es contradictorio.",
  },
  {
    origin: "INTERNA",
    daysAgo: 19,
    hour: 13,
    minute: 15,
    trigger: "Me pongo a imaginar el viaje del año que viene y me veo ya allí.",
    emotions: [
      ["Ilusión", "POSITIVA", 8],
      ["Esperanza", "POSITIVA", 7],
    ],
    areas: ["Desarrollo personal", "Finanzas"],
    involved: [],
    thoughts: ["Hace mucho que no tenía algo así en el horizonte."],
    actions: ["Miro fechas y apunto dos opciones.", "Se lo cuento a quien vendría conmigo."],
    reflection: "",
  },
  {
    origin: "EXTERNA",
    daysAgo: 21,
    hour: 16,
    minute: 50,
    trigger: "Un desconocido me ayuda cuando se me cae la compra en plena calle.",
    emotions: [
      ["Gratitud", "POSITIVA", 8],
      ["Sorpresa agradable", "POSITIVA", 7],
    ],
    areas: ["Relaciones"],
    involved: ["Desconocido"],
    thoughts: ["No hacía falta que parara y paró."],
    actions: ["Le doy las gracias dos veces.", "Se lo cuento a la primera persona que veo."],
    reflection: "",
  },
  {
    origin: "EXTERNA",
    daysAgo: 24,
    hour: 8,
    minute: 45,
    trigger: "Atasco de camino al trabajo y llego media hora tarde a una cita importante.",
    emotions: [
      ["Frustración", "NEGATIVA", 8],
      ["Vergüenza", "NEGATIVA", 6],
    ],
    areas: ["Trabajo"],
    involved: [],
    thoughts: ["Van a pensar que no soy fiable.", "Tenía que haber salido antes."],
    actions: ["Aviso por mensaje en cuanto veo que no llego.", "Pido disculpas al entrar y sigo con lo previsto."],
    reflection: "Avisar a tiempo cambió por completo cómo se recibió el retraso.",
  },
  {
    origin: "EXTERNA",
    daysAgo: 27,
    hour: 19,
    minute: 20,
    trigger: "Retomo la guitarra después de un año sin tocarla.",
    emotions: [
      ["Ilusión", "POSITIVA", 7],
      ["Nostalgia", "NEGATIVA", 5],
    ],
    areas: ["Desarrollo personal"],
    involved: [],
    thoughts: ["He perdido mucha soltura.", "Me sigue gustando igual que antes."],
    actions: ["Toco media hora.", "La dejo a la vista para no volver a olvidarla."],
    reflection: "",
  },
];

function buildDate(daysAgo: number, hour: number, minute: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo, hour, minute, 0, 0);
  return d.toISOString();
}

export function createDemoExperiences(): Experience[] {
  return SEEDS.map((seed, index) => {
    const occurredAt = buildDate(seed.daysAgo, seed.hour, seed.minute);
    return {
      id: `demo-${index + 1}`,
      origin: seed.origin,
      occurredAt,
      createdAt: occurredAt,
      description: seed.trigger,
      emotions: seed.emotions.map(([name, valence, level]) => ({ name, valence, level })),
      areas: seed.areas,
      involved: seed.involved,
      thoughts: seed.thoughts,
      actions: seed.actions,
      reflection: seed.reflection,
    };
  });
}

/** Convierte lo que envía el formulario en una entrada efímera de la demo. */
export function demoExperienceFromInput(input: ExperienceInput): Experience {
  return {
    id: `demo-nueva-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    origin: input.origin,
    occurredAt: input.occurredAt,
    createdAt: new Date().toISOString(),
    description: input.description,
    emotions: input.emotions,
    areas: input.areas,
    involved: input.involved,
    thoughts: input.thoughts,
    actions: input.actions,
    reflection: input.reflection,
  };
}
