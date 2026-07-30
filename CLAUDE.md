# Notas para trabajar en este repo

Diario personal de situaciones. Next.js 15 (App Router) + React 19 + Tailwind 4 + Prisma/SQLite.
Todo el producto, incluidos comentarios, textos de interfaz y mensajes de commit, está **en
español**.

Antes de tocar comportamiento, lee [docs/ESPECIFICACION.md](docs/ESPECIFICACION.md): es la
referencia de qué debe hacer cada pantalla. Si el código no coincide con ese documento, el error
está en el código.

## Comandos

```bash
npm run dev          # servidor de desarrollo (crea el SQLite si no existe)
npm run build:check  # compila en .next-check para verificar; NO toca el dev
npm run build        # compilación de producción real, escribe en .next
npm run typecheck    # TypeScript sin emitir
npm run user:create -- <usuario> <contraseña> ["Nombre"]
```

**Con `npm run dev` en marcha, verifica siempre con `build:check`, nunca con `build`.** Un
`next build` sobre `.next` machaca los chunks que está sirviendo el servidor de desarrollo y a
partir de ahí todo `/_next/static/...` responde 404 hasta que se borra `.next` y se reinicia.

No hay tests automatizados. La verificación se hace ejecutando la app: `/demo` trae 14
situaciones de ejemplo y no necesita cuenta, así que es el mejor sitio para probar cambios de
interfaz.

## Dónde va cada cosa

- **Lógica pura** (clasificar, agrupar, filtrar, ordenar, burbujas, serie de la línea de tiempo)
  → `src/lib/journal.ts`. Sin React y sin acceso a datos: es lo que hace que la demo y el diario
  real se comporten igual.
- **Fechas** → `src/lib/date-filter.ts`. Siempre en hora local, con claves `YYYY-MM-DD`
  construidas a mano. **Nunca `toISOString()` para obtener un día**: un registro de las 00:30
  acabaría contado en la víspera.
- **Acceso a datos** → `src/lib/experiences-repo.ts`, con `import "server-only"`. Nada de Prisma
  en componentes de cliente.
- **Vistas** → `src/components/views/`. Solo componen; la lógica va en `lib/`.
- **Rutas nuevas**: hay que crearlas en las **dos** ramas, `src/app/(diario)/` y `src/app/demo/`,
  reutilizando la misma vista.

## Reglas que es fácil romper sin querer

- **Enlaces internos siempre con `useHref()`.** Un `href` a pelo saca al visitante de la demo.
- **El proveedor va en el layout, no en la página.** Es lo que mantiene el filtro de fechas al
  navegar entre pantallas.
- **Los datos de la demo se generan en el servidor** y la rama es `force-dynamic`. Generarlos
  también en el cliente rompe la hidratación; prerenderizarlos congela los ejemplos en la fecha
  del build.
- **`src/lib/session.ts` corre en edge.** Importa `jose/jwt/sign` y `jose/jwt/verify`, nunca el
  índice `jose`, y no puede tocar Prisma.
- **Los popups van siempre por `Modal`**, que los pinta con un portal sobre `<body>`. Un
  `position: fixed` declarado dentro de la cabecera se posiciona respecto a ella, no respecto a
  la pantalla, porque su `backdrop-blur` crea bloque contenedor. El síntoma es un popup que se
  sale por arriba. Lo mismo vale para cualquier ancestro con `transform`, `filter` o `contain`.
- **Dentro de un `Modal`, el bloque que deba desplazarse necesita `flex-1 min-h-0 overflow-y-auto`.**
  El panel está topado al alto de la pantalla; sin `min-h-0` el contenido lo desborda en vez de
  hacer scroll.
- **El recorte de chips a N filas sin scroll vive en `useWrapClamp` (`src/components/useWrapClamp.ts`)
  + `src/lib/row-clamp.ts`.** Lo usan `EmotionChipGrid` (filtro) y `EmotionPicker` (formulario de
  alta); cualquier otra lista de chips que necesite lo mismo debería reutilizarlo en vez de
  reinventarlo. El consumidor **tiene que poner `ref={measureRef}`** en el contenedor oculto de
  medida — sin ese ref, `widths` se queda vacío y el hook cae siempre en «mostrar todo, sin
  recortar», sin error ni warning visible (en dev sí avisa por consola). Es justo el fallo que
  tuvo la primera versión de `EmotionChipGrid`.
- **Los nombres de emoción se comparan con `normalize()`**, sin acentos ni mayúsculas.
- **`docker-entrypoint.sh` necesita finales de línea LF.** Lo fuerza `.gitattributes`.
- Colores por grupo en `GROUP_COLOR` (`src/lib/emotions.ts`); no repartir literales de color por
  los componentes.

## Estilo

- Mobile first. Se prueba a 375 px de ancho antes que en escritorio.
- Tema oscuro con los tonos `ink-*` definidos en `src/app/globals.css`; verde para positivo,
  rojo para negativo, amarillo para ambiguo.
- Textos en español y con concordancia de número: usa `situationsLabel(grupo, n)` en lugar de
  concatenar «situaciones» con el adjetivo, o acabarás escribiendo «1 situación ambiguas».
- Comentarios solo donde el *por qué* no se deduce del código. Los que hay explican decisiones,
  no repiten lo que ya dice la línea de al lado.
