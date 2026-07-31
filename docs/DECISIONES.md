# Decisiones

Qué se decidió, quién lo decidió y por qué. Si algo del comportamiento sorprende, lo más
probable es que esté explicado aquí.

## Consultadas antes de empezar

| Pregunta | Respuesta | Consecuencia |
| --- | --- | --- |
| Stack | Next.js 15 + SQLite | Un solo contenedor, datos en un fichero dentro de un volumen |
| Emociones | Catálogo fijo **+ personalizadas** | `data/emotion-catalog.json` como base; el usuario puede crear las suyas indicando el signo |
| Cuentas | Multiusuario con diario privado | Cada entrada cuelga de un `userId`; las altas se declaran en `.users`, no hay registro público |
| Burbuja de las ambiguas | **Par dominante** | Una burbuja por entrada: la emoción positiva de mayor nivel + la negativa de mayor nivel |

Sobre el par dominante: la alternativa era generar una burbuja por cada combinación
positiva × negativa. Se descartó porque con dos emociones positivas y una negativa salían dos
burbujas para una sola entrada, y entonces la suma de las burbujas ya no cuadraba con el
recuento de «N entradas ambiguas» que aparece al lado. Con el par dominante, cuadra siempre.

## El giro a diario de emociones

El producto empezó como diario de **situaciones** y pasó a ser diario de **emociones**. El cambio
de fondo es que ahora lo primero que se pregunta es el **origen**: una emoción puede nacer de algo
que ocurrió fuera (🌍) o de un pensamiento que apareció solo (🧠), y saber cuál de las dos cosas
fue cambia por completo qué se hace con el registro.

El resto del formulario se reordenó alrededor de esa idea: **desencadenante** (que hace de título),
emociones, **pensamientos relacionados**, **respuesta** y una **reflexión posterior** opcional que
se escribe en frío.

Dos decisiones de esquema para no romper diarios que ya estuvieran en marcha:

- `origin` lleva `@default("EXTERNA")`. Añadir una columna obligatoria a una tabla con filas haría
  fallar el `db push` del arranque; con valor por defecto, las entradas antiguas —que eran todas
  situaciones externas— quedan clasificadas correctamente sin tocar nada.
- El campo `trigger` se mapea con `@map("situation")` sobre la columna original. Renombrar la
  columna de verdad significaría, en SQLite, borrarla y crearla: `prisma db push` lo detectaría
  como pérdida de datos y se detendría. El nombre de la columna es el precio de no perder texto ya
  escrito.

## Tomadas al construir

### Todo el filtrado ocurre en el cliente

El servidor entrega las entradas del usuario una sola vez. Filtrar por fecha, por emoción,
reordenar o cambiar de pantalla no vuelve a llamar al servidor. Un diario personal no pasa de
unos miles de registros; a cambio, la interfaz responde al instante. Si algún día un diario
creciera lo bastante como para que esto molestara, el punto donde se cambia es
`listExperiences()`, no las vistas.

### El filtro de fechas no va en la URL

Vive en el estado del proveedor, montado en el layout. Next no desmonta los layouts al navegar
entre páginas hermanas, así que el filtro sobrevive de una pantalla a otra sin ensuciar la URL
ni obligar a que cada enlace arrastre parámetros. El coste es que una recarga completa vuelve al
rango por defecto, que para el uso previsto es aceptable.

### Emociones desnormalizadas

No hay tabla de emociones. Cada `ExperienceEmotion` guarda nombre y valencia. El catálogo que ve
el usuario se calcula uniendo el fichero base con las emociones personalizadas que ya aparecen
en sus registros. Así no hay proceso de *seed* que mantener, ampliar el catálogo base no toca
datos históricos, y una emoción escrita a mano funciona igual que una del catálogo. La
comparación se hace sin acentos ni mayúsculas para que «Ansiedad» y «ansiedad» no se dupliquen.

### Las cuentas se declaran en un fichero, no se crean a mano

`.users` en el servidor es la única fuente: el contenedor lo sincroniza en cada arranque, así que
dar de alta a alguien o cambiar una contraseña es editar un fichero y reiniciar. Es lo que hace
coherente el aviso de la demo, y evita que el estado real dependa de qué comandos se ejecutaron
en qué orden.

Quitar a alguien del fichero **no** lo borra, solo se avisa por el log: borrar una cuenta se
lleva por delante todas sus entradas, y eso no puede ser un efecto secundario de reiniciar un
contenedor. Para eso está `scripts/delete-user.mjs --confirmar`.

### La demo comparte el código con el diario real

Las dos ramas montan los mismos componentes; solo cambia el proveedor de datos y el prefijo de
los enlaces. La alternativa —una demo con su propio código— habría envejecido mal: cualquier
mejora habría que hacerla dos veces.

### `prisma db push` en vez de migraciones

Para una base SQLite de un puñado de tablas, mantener un historial de migraciones es más
ceremonia que valor. `db push` sincroniza al arrancar y se detiene solo si el cambio implicara
perder datos. Si el esquema empezara a evolucionar con frecuencia, merecería la pena pasar a
`prisma migrate`.

### Zoom mínimo de la línea de tiempo

Cuando caben pocos días y alguno acumula muchas entradas, el ancho que llenaría la pantalla
haría que las columnas se salieran por arriba. En ese caso mínimo y máximo coinciden y la línea
se queda corta: es la condición que se pidió y está garantizada por la propia fórmula, no por un
recorte visual. La aritmética está en [ARQUITECTURA.md](ARQUITECTURA.md).

## Pendientes conscientes

Cosas que no se han hecho porque no estaban en el encargo, ordenadas por lo probable que es que
hagan falta:

- **Cambiar la contraseña desde la web.** Se hace editando `.users` en el servidor.
- **Limitar los intentos de login.** Detrás de un túnel privado el riesgo es bajo, pero un
  contador por IP sería barato de añadir en la server action.
- **Exportar el diario** a JSON o CSV.
- **Editar una emoción ya guardada** o fusionar dos que se escribieron distinto.
