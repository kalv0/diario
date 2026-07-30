# Especificación funcional

Lo que hace cada pantalla y las reglas exactas que aplican. Es el documento de referencia
cuando algo se comporte de forma dudosa: si el código no coincide con esto, es un error.

## Conceptos

**Situación (o experiencia).** Un registro con fecha y hora, una descripción, una o más
emociones con su nivel, una lista de pensamientos y una lista de acciones.

**Valencia.** Toda emoción es positiva o negativa. No hay término medio a nivel de emoción:
la ambigüedad aparece en la situación, no en el sentimiento suelto.

**Grupo.** Se deduce de las emociones de la situación, no se elige a mano:

| Emociones que contiene | Grupo | Color |
| --- | --- | --- |
| Solo positivas | positivas | verde |
| Solo negativas | negativas | rojo |
| De los dos signos | ambiguas | amarillo |

**Intensidad de una situación.** El nivel más alto de todas sus emociones. Es lo que ordena
el listado cuando se ordena «por mayor intensidad».

---

## Filtro de fechas (cabecera, en todas las pantallas)

Es el único filtro global: afecta a las burbujas, a los recuentos, al listado, a la línea de
tiempo y a las páginas de grupo.

- Opciones: **Hoy**, **7 días**, **30 días** y **fecha personalizada**.
- Por defecto abre en **30 días** (hoy y los 29 anteriores). «7 días» es hoy y los 6 anteriores.
- La fecha personalizada se elige en un calendario:
  - Sin filtro personalizado activo se abre en **el mes actual**, con **hoy marcado** con un punto.
  - Con filtro activo se abre en el mes del día elegido, o en el del **final del rango**.
  - Se puede cambiar de mes **entre el mes del primer registro y el mes actual**, ambos incluidos.
    Nunca a meses futuros ni anteriores a la primera entrada del diario, y los días futuros del
    mes en curso salen deshabilitados.
  - Un toque elige un día; el segundo cierra el rango. Si el segundo día es anterior al primero,
    pasa a ser el inicio.
  - No se aplica nada hasta pulsar **Aplicar**.
- Volver a un preset (Hoy / 7 días / 30 días) **borra la fecha personalizada**: al reabrir el
  calendario se vuelve a ver el mes actual con hoy marcado y sin selección.

## Filtro de emociones y orden (listado, línea de tiempo y páginas de grupo)

Dos desplegables uno junto al otro: **«Filtra por emociones»** a la izquierda, **«Ordena»** a la
derecha. Cada uno abre un popup al tocarlo; no ocupan sitio en la página hasta que se abren.

**Filtra por emociones.** El botón lleva icono de embudo y se resalta cuando hay algún filtro
activo. Dentro del popup:

- Un botón de papelera en la cabecera, junto al cierre, aparece **solo cuando hay algo que
  limpiar** (signo o alguna emoción concreta marcada) y desaparece en cuanto se limpia.
- **Signo**: «Positivas» y «Negativas» son de **selección única**. Marcar uno desmarca el otro, y
  volver a pulsar el que está activo lo quita. Solo aparecen si en pantalla hay emociones de los
  dos signos: en un grupo de un solo signo no habría nada que elegir.
- **Emociones concretas**: chips ordenados por frecuencia, con el recuento al lado, en una
  cuadrícula que ajusta filas, **nunca con scroll**. Se muestran como mucho **4 filas**; si no
  caben todas, la última posición se convierte en un botón **«Ver más»** que despliega el resto
  (y pasa a «Ver menos» para volver a recogerlas). **Con un signo activo solo se ofrecen las
  emociones de ese signo**, tanto aquí como en el diagrama de barras de la página de grupo.
- Al **cambiar de signo se desmarcan las emociones concretas del signo contrario**, porque dejan
  de estar a la vista y un filtro activo que no se ve es un filtro que nadie entiende.

**Ordena.** El botón muestra icono de orden y el criterio activo («Ordena: Más recientes» /
«Ordena: Mayor intensidad»). Al tocarlo se abre un popup con las dos opciones; elegir una la
aplica y cierra el popup. Con alguna emoción concreta marcada el criterio pasa automáticamente a
intensidad; al desmarcarlas todas vuelve a «más recientes». Elegir un criterio a mano manda hasta
volver a tocar los filtros.

## Pantalla principal `/`

Sin scroll: ocupa exactamente el alto de la pantalla.

- La vertical se reparte **solo entre los grupos que tienen situaciones** en el rango:
  uno ocupa todo el alto, dos la mitad cada uno, tres un tercio cada uno.
- El orden vertical es fijo: **positivas arriba, ambiguas en medio, negativas abajo**.
- Cada franja muestra su recuento («12 situaciones positivas», «1 situación ambigua»).
- Las emociones se dibujan como **burbujas en movimiento continuo**:
  - Todas a la **misma velocidad**, con **dirección inicial aleatoria**, rebotando contra los
    bordes de su franja.
  - El **radio crece con la raíz del número de situaciones** que referencian esa emoción, de
    modo que el área es proporcional al recuento. Si entre todas ocupan más de un tercio de la
    franja, se reescalan a la baja por igual.
  - En positivas y negativas cada burbuja es **una emoción**. En ambiguas, la **combinación
    única positiva + negativa**: la emoción positiva de mayor nivel junto a la negativa de mayor
    nivel de esa situación (ver [DECISIONES.md](DECISIONES.md)).
  - Con `prefers-reduced-motion` las burbujas se colocan pero no se mueven.
- Al pulsar una franja se abre la página de ese grupo.
- Abajo, centrado y siempre en el mismo sitio: el botón **(+)**, y justo debajo los accesos a
  **Experiencias** y a **Línea de tiempo**.

## Formulario de nueva situación

Se abre desde el (+) en cualquier pantalla que lo tenga y pregunta, en este orden:

1. **Día y hora** — precargados con el momento en que se pulsó el (+). No admite futuro.
2. **Situación** — qué ocurre, con quién estoy, dónde, etc.
3. **Emociones** — una o más, cada una con **nivel de 0 a 10**. Se eligen de un catálogo
   separado por signo, con buscador, y se pueden crear nuevas escribiéndolas: se guardan con el
   signo que esté activo en el conmutador. Los chips del catálogo se muestran **sin scroll, como
   mucho 4 filas**; si no caben todos, la última posición es un botón «Ver más» (y «Ver menos»
   para recogerlos). Mientras se escribe una emoción nueva, el chip de crearla va siempre
   primero, visible sin necesidad de desplegar nada.
4. **Pensamientos** — lista, una tarjeta por pensamiento.
5. **Acciones** — lista, una tarjeta por acción.

Situación y al menos una emoción son obligatorias. El servidor revalida todo lo que llega.

## Página de experiencias `/experiencias`

- Entra **sin filtros de emoción** y ordenada **de más reciente a menos**.
- Se puede ordenar además por **mayor intensidad**.
- Lleva el bloque «Filtra por emociones» descrito más arriba.
- Hereda el filtro de fechas de la cabecera.
- Cada situación es una tarjeta resumen; al pulsarla se abre el **detalle completo** en un popup
  con **flechas laterales** para ir a la anterior y a la siguiente **según el orden en que se
  esté viendo la lista**. También funcionan las flechas del teclado.

## Línea de tiempo `/linea-tiempo`

- Representa el rango de fechas activo como una línea horizontal con un cuadrado por situación,
  **verdes hacia arriba** (situaciones con alguna emoción positiva) y **rojos hacia abajo** (con
  alguna emoción negativa). Una situación ambigua suma en los dos lados.
- Los cuadrados son cuadrados: el lado es el **ancho de día**, así que la altura de una columna
  es `nº de situaciones × ancho de día`.
- Botones de **más y menos zoom** que cambian ese ancho de día:
  - **Zoom máximo**: el mayor ancho que respeta la altura reservada al diagrama (≈ un tercio del
    alto de pantalla). Sale de `(alto del diagrama / 2) / día con más situaciones`.
  - **Zoom mínimo**: el que hace que la línea ocupe todo el ancho disponible, **salvo** que ese
    ancho supere el máximo anterior. Cuando eso pasa, mínimo y máximo coinciden y la línea se
    queda corta a propósito, para no rebasar nunca la altura.
  - Con muchos días, los días quedan muy estrechos y la línea se desplaza lateralmente.
- El bloque «Filtra por emociones» afecta **al diagrama y al listado a la vez**.
- Debajo del diagrama va el listado de experiencias con esos mismos filtros.

## Página de grupo `/grupo/{positivas|negativas|ambiguas}`

- **Diagrama de barras** con las emociones más presentes en el grupo, con scroll lateral cuando
  no caben. En el grupo ambiguo se cuentan las emociones sueltas de los dos signos, no las
  combinaciones: es lo que hace útil el diagrama.
- Pulsar una barra **marca o desmarca** esa emoción en el filtro, y queda sincronizado con el
  selector de abajo: da igual por dónde se toque. Con un signo activo, el diagrama solo muestra
  las emociones de ese signo, para que no haya barras que al pulsarlas contradigan el filtro.
- El signo solo se puede elegir en el grupo **ambiguo**, que es el único con emociones de los dos
  tipos.
- Debajo, el listado de experiencias del grupo, con el mismo detalle en popup y las mismas
  flechas de navegación.

## Login `/login`

- Usuario y contraseña. No hay registro público.
- Debajo: «¿No tienes cuenta? **Prueba la demo**», que lleva a `/demo`.
- Si se entra a una página privada sin sesión, se redirige al login y después se vuelve a la
  página que se pedía.

## Demo `/demo`

- El diario completo —burbujas, listado, línea de tiempo, páginas de grupo— con **14 situaciones
  de ejemplo** generadas siempre relativas a hoy, para que nunca se vea vacío.
- **Se pueden añadir situaciones nuevas y funcionan con normalidad, pero no se guardan**: viven en
  memoria hasta que se recarga la página. El propio formulario lo avisa.
- En la cabecera, un CTA discreto **«Obtener cuenta»** abre un aviso explicando que la cuenta la
  da el administrador por correo: **raul@calvo.cc**, con enlace `mailto:` y botón para copiar la
  dirección.
