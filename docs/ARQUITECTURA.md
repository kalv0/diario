# Arquitectura

## Stack

| Pieza | Elección | Por qué |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) + React 19 | UI y API en un solo proceso, un solo contenedor |
| Lenguaje | TypeScript estricto | — |
| Estilos | Tailwind CSS 4 | Sin fichero de configuración; el tema vive en `globals.css` |
| Base de datos | SQLite vía Prisma 6 | Un diario personal no necesita un servidor de base de datos: un fichero en un volumen es más fácil de respaldar y de mover |
| Sesión | JWT HS256 en cookie `httpOnly` (`jose`) | Sin dependencias de sesión en servidor; el middleware puede validarla en el runtime edge |
| Contraseñas | bcrypt (`bcryptjs`, coste 12) | Implementación en JS puro: no hay que compilar nada en Alpine |

No hay tipografías externas ni CDNs: la app funciona sin salir a internet, que es justo lo que
se espera de algo que va detrás de un túnel privado.

## Flujo de datos

La decisión que explica casi todo lo demás: **el cliente carga todas las experiencias del
usuario una vez y filtra, agrupa y ordena en memoria**.

```
Prisma → listExperiences(userId) → layout de servidor
                                        ↓ props
                              <JournalProvider>  ← estado del filtro de fechas
                                        ↓ contexto
             burbujas · listado · línea de tiempo · páginas de grupo
```

El diario de una persona son como mucho unos miles de registros; caben de sobra en memoria.
A cambio, cambiar un filtro, un orden o el rango de fechas es instantáneo y no cuesta un viaje
al servidor. Solo hay una llamada de escritura: `POST /api/experiences`.

El proveedor se monta en el **layout** de cada rama, no en las páginas. Como Next no
desmonta los layouts al navegar entre páginas hermanas, el filtro de fechas se mantiene al
pasar de las burbujas al listado o a la línea de tiempo sin necesidad de llevarlo en la URL.

### Demo y diario real comparten todo

Las dos ramas montan los mismos componentes con distinto proveedor:

| | `/` (diario real) | `/demo` |
| --- | --- | --- |
| Origen de datos | SQLite del usuario con sesión | `createDemoExperiences()`, relativo a hoy |
| `addExperience` | `POST /api/experiences` | Solo estado de React |
| `basePath` | `""` | `"/demo"` |

Todos los enlaces internos pasan por `useHref()`, que antepone el `basePath`. Por eso la demo
navega dentro de sí misma sin duplicar ni una vista.

Los datos de ejemplo se generan **en el servidor** y se serializan al cliente. Si se generasen
en los dos lados, las fechas relativas a «ahora» no coincidirían y React se quejaría de la
hidratación. Por lo mismo la rama de demo es `force-dynamic`: prerenderizarla en el build
dejaría los ejemplos congelados en la fecha de compilación.

## Modelo de datos

```
User ──< Experience ──< ExperienceEmotion   (name, valence, level 0-10)
                    ──< Thought             (text, position)
                    ──< Action              (text, position)
```

Las emociones se guardan **desnormalizadas** dentro de cada experiencia. El catálogo base está
en `data/emotion-catalog.json` y el catálogo que ve el usuario es la unión de ese fichero con
las emociones personalizadas que ya ha usado (`buildCatalog`). Ventajas: no hace falta tabla de
emociones ni proceso de *seed*, y añadir emociones al catálogo base nunca toca datos históricos.

Los nombres se comparan con `normalize()` —minúsculas y sin acentos— para que «Ansiedad» y
«ansiedad» no generen dos burbujas.

## Autenticación

1. `POST` del formulario de login a una *server action* → `authenticate()` compara con bcrypt.
   Se compara siempre, también cuando el usuario no existe, para no filtrar por tiempo de
   respuesta qué nombres están dados de alta.
2. Se firma un JWT `{uid, username}` y se guarda en la cookie `dds_session`
   (`httpOnly`, `sameSite=lax`, `secure` en producción).
3. `middleware.ts` deja pasar `/login` y `/demo`; para el resto exige una cookie con firma
   válida. Solo comprueba la firma, sin tocar la base de datos: corre en el runtime edge.
4. Cada layout privado vuelve a resolver el usuario con `getCurrentUser()`, que sí consulta la
   base de datos. Así una cuenta borrada deja de tener acceso aunque su cookie siga siendo válida.

`src/lib/session.ts` importa `jose/jwt/sign` y `jose/jwt/verify` en vez del índice del paquete:
el índice arrastra el código de JWE, que usa `CompressionStream` y no existe en edge.

## Mapa de ficheros

```
data/emotion-catalog.json      Catálogo base de emociones por signo
prisma/schema.prisma           Esquema de la base de datos
scripts/                       Alta y listado de usuarios (JS plano, sin build)

src/lib/
  types.ts                     Tipos compartidos
  emotions.ts                  Catálogo, normalización, colores por grupo
  journal.ts                   Toda la lógica pura: clasificar, agrupar, filtrar, ordenar,
                               burbujas, recuentos y serie de la línea de tiempo
  date-filter.ts               Filtro de fechas, rangos, formato y utilidades de calendario
  session.ts                   Firma y verificación del JWT (compatible con edge)
  auth.ts                      Contraseñas, cookie y usuario actual (solo servidor)
  db.ts                        Cliente de Prisma
  experiences-repo.ts          Lectura y escritura de experiencias (solo servidor)
  demo-data.ts                 Las 14 situaciones de ejemplo

src/components/
  JournalProvider.tsx          Contexto: datos, filtro de fechas, alta de experiencias
  AppHeader.tsx                Cabecera común con el filtro de fechas centrado
  DateFilterBar.tsx            Presets + calendario
  MonthCalendar.tsx            Calendario de un mes con día suelto o rango
  BubblesView.tsx              Reparto de la pantalla en franjas
  BubbleField.tsx              Física de las burbujas
  MainActions.tsx              (+) y accesos a listado y línea de tiempo
  ExperienceForm.tsx           Formulario de alta
  EmotionPicker.tsx            Selección de emociones con nivel
  ListEditor.tsx               Listas de pensamientos y acciones
  ExperienceCard.tsx           Tarjeta resumen
  ExperienceDetail.tsx         Detalle en popup con navegación entre contiguas
  ExperienceResults.tsx        Listado + detalle
  EmotionFilterControls.tsx    Filtros por signo y emoción, y selector de orden
  useEmotionFilter.ts          Estado de filtros y regla de orden automático
  Timeline.tsx                 Diagrama tipo cotización con zoom
  GroupBarChart.tsx            Barras de emociones de un grupo
  DemoAccountCta.tsx           CTA y aviso de «pídesela al administrador»
  views/                       Composición de cada pantalla

src/app/
  (diario)/                    Rama privada: /, /experiencias, /linea-tiempo, /grupo/[tipo]
  demo/                        Misma estructura, datos de ejemplo
  login/                       Pantalla y server actions de sesión
  api/experiences/             GET (listar) y POST (crear)
  middleware.ts                Puerta de entrada
```

## La física de las burbujas

`BubbleField` no guarda las posiciones en estado de React: las escribe directamente sobre el
DOM (`transform`) dentro del bucle de `requestAnimationFrame`. Con veinte o treinta burbujas a
60 fps, re-renderizar en cada fotograma se nota en la batería de un móvil.

El contenedor se mide en `useLayoutEffect` con `getBoundingClientRect()` **y además** con un
`ResizeObserver`: el observer no entrega su primera notificación hasta que el navegador produce
un fotograma, y hasta entonces las burbujas tendrían radio cero.

Al cambiar el filtro se conservan las posiciones de las burbujas que siguen existiendo, para
que la escena no se reinicie de golpe.

## Aritmética de la línea de tiempo

Los cuadrados son cuadrados, así que la altura de una columna es `nº × anchoDeDía`. De ahí sale
todo lo demás:

```
anchoMáx = min( (altoDelDiagrama / 2) / díaConMásSituaciones , 44px )
anchoAjuste = anchoDisponible / nºDeDías
anchoMín = min( anchoAjuste , anchoMáx )
anchoDeDía = anchoMín + (anchoMáx - anchoMín) × (zoom / 8)
```

Como `anchoMín ≤ anchoMáx` y `anchoMáx × díaConMásSituaciones ≤ altoDelDiagrama / 2`, el
diagrama **no puede** rebasar su altura en ningún nivel de zoom. Cuando `anchoAjuste` supera al
máximo, mínimo y máximo coinciden y la línea no llega a ocupar todo el ancho: es el
comportamiento correcto, no un fallo de maquetación.
