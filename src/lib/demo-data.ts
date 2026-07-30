import type { Experience, ExperienceInput } from "./types";

/**
 * Experiencias de ejemplo de /demo. Se generan relativas a "hoy" para que
 * siempre caigan dentro del filtro por defecto (últimos 30 días) y la demo
 * nunca se vea vacía. No se guardan en ninguna parte.
 */

interface Seed {
  /** Días hacia atrás desde hoy. */
  daysAgo: number;
  hour: number;
  minute: number;
  situation: string;
  emotions: Array<[string, "POSITIVA" | "NEGATIVA", number]>;
  thoughts: string[];
  actions: string[];
}

const SEEDS: Seed[] = [
  {
    daysAgo: 0,
    hour: 9,
    minute: 20,
    situation: "Reunión de equipo por la mañana. Presento el avance del proyecto delante de todo el departamento.",
    emotions: [
      ["Ansiedad", "NEGATIVA", 6],
      ["Orgullo", "POSITIVA", 7],
    ],
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
  },
  {
    daysAgo: 1,
    hour: 21,
    minute: 45,
    situation: "Cena en casa con mi hermana. Hacía semanas que no nos veíamos con calma.",
    emotions: [
      ["Cariño", "POSITIVA", 9],
      ["Alegría", "POSITIVA", 8],
    ],
    thoughts: ["Esto es lo que echaba de menos.", "Tendríamos que hacerlo más a menudo."],
    actions: ["Cocino sin prisa.", "Dejo el móvil en otra habitación.", "Quedamos para repetir en dos semanas."],
  },
  {
    daysAgo: 2,
    hour: 17,
    minute: 10,
    situation: "Discusión con un compañero por un cambio que hizo sin avisar.",
    emotions: [
      ["Enfado", "NEGATIVA", 8],
      ["Frustración", "NEGATIVA", 7],
    ],
    thoughts: ["Otra vez lo mismo.", "No me está tomando en serio.", "Si digo algo, va a parecer que exagero."],
    actions: ["Contesto en tono seco.", "Me levanto a por agua para cortar la conversación.", "Le escribo por la tarde para aclararlo."],
  },
  {
    daysAgo: 3,
    hour: 7,
    minute: 30,
    situation: "Salgo a correr al amanecer antes de empezar el día.",
    emotions: [
      ["Calma", "POSITIVA", 8],
      ["Motivación", "POSITIVA", 7],
    ],
    thoughts: ["Qué bien sienta madrugar cuando lo consigo."],
    actions: ["Dejo la ropa preparada la noche anterior.", "Hago 6 km sin mirar el reloj."],
  },
  {
    daysAgo: 4,
    hour: 12,
    minute: 0,
    situation: "Llamada del médico con los resultados de una revisión rutinaria. Todo bien, pero he pasado tres días esperando.",
    emotions: [
      ["Alivio", "POSITIVA", 9],
      ["Angustia", "NEGATIVA", 6],
    ],
    thoughts: ["Llevo tres días imaginando lo peor.", "He gastado mucha energía en algo que no controlaba."],
    actions: ["Cuelgo y llamo a casa para contarlo.", "Me tomo la tarde con más calma."],
  },
  {
    daysAgo: 6,
    hour: 23,
    minute: 15,
    situation: "No consigo dormirme repasando la lista de cosas pendientes de la semana.",
    emotions: [
      ["Ansiedad", "NEGATIVA", 7],
      ["Agobio", "NEGATIVA", 6],
    ],
    thoughts: ["No voy a llegar a todo.", "Mañana voy a estar destrozado."],
    actions: ["Me levanto y apunto todo en una lista.", "Dejo el móvil fuera de la habitación."],
  },
  {
    daysAgo: 8,
    hour: 18,
    minute: 40,
    situation: "Termino un proyecto en el que llevaba meses atascado y lo entrego.",
    emotions: [
      ["Satisfacción", "POSITIVA", 9],
      ["Alivio", "POSITIVA", 8],
    ],
    thoughts: ["Al final sí era capaz.", "Ha costado más de lo que pensaba, pero está."],
    actions: ["Lo envío y cierro el portátil.", "Me doy la tarde libre sin culpa."],
  },
  {
    daysAgo: 10,
    hour: 15,
    minute: 25,
    situation: "Me entero por redes de que un grupo de amigos ha quedado y no me han avisado.",
    emotions: [
      ["Tristeza", "NEGATIVA", 7],
      ["Rechazo", "NEGATIVA", 6],
      ["Envidia", "NEGATIVA", 4],
    ],
    thoughts: ["¿He hecho algo mal?", "A lo mejor simplemente se les ha pasado.", "Siempre soy el último en enterarme."],
    actions: ["Cierro la aplicación.", "Le escribo a uno de ellos por privado en vez de dar por hecho lo peor."],
  },
  {
    daysAgo: 12,
    hour: 11,
    minute: 5,
    situation: "Digo que no a un encargo extra que no me cabía en la semana.",
    emotions: [
      ["Culpa", "NEGATIVA", 6],
      ["Orgullo", "POSITIVA", 7],
      ["Seguridad", "POSITIVA", 5],
    ],
    thoughts: ["Van a pensar que no tengo ganas.", "Es la primera vez que lo digo sin dar mil explicaciones."],
    actions: ["Contesto por escrito y en dos líneas.", "Propongo una fecha alternativa."],
  },
  {
    daysAgo: 15,
    hour: 20,
    minute: 30,
    situation: "Tarde entera sin plan, viendo series y con la sensación de estar perdiendo el tiempo.",
    emotions: [
      ["Aburrimiento", "NEGATIVA", 5],
      ["Culpa", "NEGATIVA", 4],
    ],
    thoughts: ["Debería estar haciendo algo productivo.", "Tampoco pasa nada por descansar."],
    actions: ["Salgo a dar una vuelta de veinte minutos.", "Vuelvo y termino el capítulo sin darle más vueltas."],
  },
  {
    daysAgo: 18,
    hour: 10,
    minute: 0,
    situation: "Comida familiar por el cumpleaños de mi madre. Mucha gente y conversación cruzada.",
    emotions: [
      ["Cariño", "POSITIVA", 8],
      ["Agobio", "NEGATIVA", 5],
    ],
    thoughts: ["Me alegro de verlos a todos.", "Necesito un rato a solas para recargar."],
    actions: ["Salgo diez minutos al balcón.", "Vuelvo y me siento en la punta de la mesa, más tranquilo."],
  },
  {
    daysAgo: 21,
    hour: 16,
    minute: 50,
    situation: "Un desconocido me ayuda cuando se me cae la compra en plena calle.",
    emotions: [
      ["Gratitud", "POSITIVA", 8],
      ["Sorpresa agradable", "POSITIVA", 7],
    ],
    thoughts: ["No hacía falta que parara y paró."],
    actions: ["Le doy las gracias dos veces.", "Se lo cuento a la primera persona que veo."],
  },
  {
    daysAgo: 24,
    hour: 8,
    minute: 45,
    situation: "Atasco de camino al trabajo y llego media hora tarde a una cita importante.",
    emotions: [
      ["Frustración", "NEGATIVA", 8],
      ["Vergüenza", "NEGATIVA", 6],
    ],
    thoughts: ["Van a pensar que no soy fiable.", "Tenía que haber salido antes."],
    actions: ["Aviso por mensaje en cuanto veo que no llego.", "Pido disculpas al entrar y sigo con lo previsto."],
  },
  {
    daysAgo: 27,
    hour: 19,
    minute: 20,
    situation: "Retomo la guitarra después de un año sin tocarla.",
    emotions: [
      ["Ilusión", "POSITIVA", 7],
      ["Nostalgia", "NEGATIVA", 5],
    ],
    thoughts: ["He perdido mucha soltura.", "Me sigue gustando igual que antes."],
    actions: ["Toco media hora.", "La dejo a la vista para no volver a olvidarla."],
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
      occurredAt,
      createdAt: occurredAt,
      situation: seed.situation,
      emotions: seed.emotions.map(([name, valence, level]) => ({ name, valence, level })),
      thoughts: seed.thoughts,
      actions: seed.actions,
    };
  });
}

/** Convierte lo que envía el formulario en una experiencia efímera de la demo. */
export function demoExperienceFromInput(input: ExperienceInput): Experience {
  return {
    id: `demo-nueva-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    occurredAt: input.occurredAt,
    createdAt: new Date().toISOString(),
    situation: input.situation,
    emotions: input.emotions,
    thoughts: input.thoughts,
    actions: input.actions,
  };
}
