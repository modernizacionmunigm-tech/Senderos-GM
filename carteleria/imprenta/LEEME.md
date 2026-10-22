# Archivos para la imprenta — Senderos del Monte Mitre

**33 archivos SVG, listos para imprimir.** Están a **tamaño real en milímetros**
(1 unidad = 1 mm en el archivo), con **5 mm de sangrado** por lado y con **todo el
texto convertido a curvas**: no dependen de que el taller tenga las tipografías
instaladas. Se abren igual en Illustrator, Inkscape, CorelDRAW o el navegador.

> Estos archivos **no se editan a mano**. Se generan con
> `carteleria/herramientas/generar-imprenta.js`, que los arma a partir del diseño
> de `carteleria/mockups.html` y de los datos reales de `app/src/data.ts`. Si hay
> que cambiar algo, se cambia en el mockup y se vuelve a generar (ver el final).

## Qué hay en la carpeta

| Archivo | Qué es | Medida | Cuántos |
|---|---|---|---|
| `01-cartel-puerta-1400x1000.svg` | **El cartel de la puerta. Esta es la pieza que va.** | 1400 × 1000 mm | 1 |
| `01b-cartel-puerta-voz-app-1400x1000.svg` | El mismo cartel en la voz de la app (la versión blanca). **Queda como referencia, no se imprime.** | 1400 × 1000 mm | — |
| `02-placa-inicio-frente-{baja,media,alta}-250x200.svg` | Frente de la placa de inicio: nombre del sendero, datos y "▶ EMPEZÁ ACÁ" | 250 × 200 mm | 3 |
| `03-placa-meta-dorso-{baja,media,alta}-250x200.svg` | Dorso de esa misma placa: "¡LLEGASTE!" y "Registrá tu tiempo" | 250 × 200 mm | 3 |
| `04-punto-{baja,media,alta}-NN-250x200.svg` | Placas de punto numerado (NN = 01 a 08 en Baja, 01 a 07 en Media y Alta) | 250 × 200 mm | 22 |
| `05-flecha-{baja,media,alta}-300x100.svg` | Flechas de orientación, una por color de sendero | 300 × 100 mm | 3 |

Las placas de inicio y de meta son **la misma placa, doble cara**: el frente (`02`)
y el dorso (`03`) se imprimen de los dos lados de cada una de las 3 placas.

La numeración de los 22 puntos es la que muestra la app: **el inicio (▶) y la meta
(■) no consumen número**. Baja tiene 8, Media 7, Alta 7.

> **Falta una pieza del esquema: el cartel de reglamento** (60 × 45 cm, un solo
> ejemplar, en la cabecera). Todavía **no está dibujado ni generado**: es la única
> del esquema simplificado que falta. Los textos ya están escritos (sección 4.F de
> `CARTELERIA.md`) y las recomendaciones largas de todas las otras piezas remiten
> a él, así que conviene cerrarlo antes de la imprenta.

## Especificaciones

- **Sangrado: 5 mm por lado.** El archivo mide la pieza + 10 mm en cada dimensión,
  y los colores que tocan el borde lo continúan. **El corte va en la medida
  nominal** (por ejemplo el cartel de la puerta: 1400 × 1000 mm).
- **Imprimir al 100 %, sin escalar.** Nada de "ajustar a la página".
- Colores de referencia de la marca (RGB, tal como están en el archivo; para
  taller que pida CMYK, avisar y se convierten):

  | Color | HEX | Dónde |
  |---|---|---|
  | Azul profundo municipal | `#003366` | Títulos, bandas institucionales, texto |
  | Celeste municipal | `#9BCBEB` | Campo del cartel de la puerta |
  | Tierra pampeana | `#A67C52` | Banda al pie del cartel de la puerta |
  | Verde sendero Baja | `#10B981` | Campos de color del sendero Baja |
  | Ámbar sendero Media | `#F59E0B` | Campos de color del sendero Media |
  | Rojo sendero Alta | `#EF4444` | Campos de color del sendero Alta |

- **Tipografías**: Space Grotesk (700/600) e Inter (400/500/600), las dos libres.
  En estos archivos ya están **en curvas**; igual quedan los TTF en
  `carteleria/fuentes/` por si hay que rehacer algún texto.
- **Los logos son parte del archivo** (van embebidos en base64): no hay que
  mandarlos aparte ni hay riesgo de que se pierdan al mover los archivos.

## ⚠️ Falta completar antes de imprimir

1. **Los QR.** En los archivos hay un **recuadro punteado que dice "QR"** con su
   medida (180 × 180 mm en el cartel de la puerta, 88 × 88 mm en el frente de la
   placa y 80 × 80 mm en el dorso). **Ese recuadro no se imprime**: cuando la
   dirección esté cerrada, se genera el QR, se coloca en el mockup y se vuelven a
   generar los archivos. Los 22 puntos **no llevan QR** (decidido: la app no
   arranca sin señal, así que ahí no sirve).
2. **Tres datos que van marcados con ▢** (no se inventaron):
   - la **URL corta** que va impresa (`senderos.guardiamitre.gob.ar` es provisional),
   - el **número de ordenanza**,
   - el **teléfono de emergencia real** (además del 911).

   Los ▢ se ven como **cuadraditos dibujados** dentro del texto: es a propósito,
   para que se note que falta el dato y no pase inadvertido al imprimir.

## Avisos del armado (cosas que hay que mirar)

Los **nombres de los puntos y las descripciones salen de la app**
(`app/src/data.ts`), igual que las distancias. La cartelería y el celular no pueden
decir cosas distintas: si un punto se renombra en la app, se vuelve a generar y el
cartel cambia solo (así entraron los nombres nuevos de los puntos de Baja).

Los textos se acomodan solos con las medidas reales de la tipografía. Hoy **todos
los nombres entran en uno o dos renglones a 15 mm**; lo único que hubo que ajustar
son cuatro descripciones, que bajaron de tamaño para entrar en tres renglones sin
salirse de la placa:

- **Descripciones en 10 mm**: punto 2 de Media.
- **Descripciones en 9,5 mm**: punto 3 de Media, punto 1 de Alta y punto 6 de Alta.
- El resto de las descripciones va en 10,5 mm.

Y dos cosas que no son de texto:

- **Las flechas apuntan a la derecha.** Se hizo una por color de sendero como
  modelo; la cantidad y los lugares definitivos salen del relevamiento en el
  terreno. Si hace falta alguna que apunte a la izquierda, se agrega al mockup y se
  vuelve a generar.
- En el borde de las placas chicas (los 5 mm de sangrado) las franjas de color del
  sendero se continúan como **banda llena** a los costados, no franja por franja: es
  imperceptible una vez cortada la placa, pero conviene que el taller lo sepa.

## Cómo se vuelven a generar

Necesita **Node** y la librería `opentype.js` (la que convierte las letras a curvas).
Se instala **en una carpeta aparte**, no dentro del proyecto (acá no se versiona
`node_modules`):

```powershell
# una sola vez, en una carpeta cualquiera
mkdir C:\temp\senderos-tools; cd C:\temp\senderos-tools
npm i opentype.js

# cada vez que se toque el diseño
cd "C:\Users\Lenovo\Documents\Proyectos\Modernizacion Municipalidad\Senderos"
$env:NODE_PATH = "C:\temp\senderos-tools\node_modules"
node "carteleria\herramientas\generar-imprenta.js"
```

El script lee el diseño de `carteleria/mockups.html` y los datos de
`app/src/data.ts` (no hay medidas ni datos copiados a mano), y **avisa por consola**
si algún nombre o descripción no entra, si un carácter no está en la tipografía o
si tuvo que achicar un texto. Si algo no cierra, **corta y no escribe nada**:
conviene que grite en vez de entregar archivos a medias.

## Control que se hizo sobre estos 33 archivos

- Ninguno tiene texto suelto: **todo es curvas** (y ningún trazado tiene valores
  inválidos).
- Los 33 son XML válido: se abren sin errores en el navegador.
- La tinta de los textos **no se sale del área impresa** en ninguna pieza.
- Los logos van embebidos como datos en los 5 archivos que los llevan
  (el cartel de la puerta municipal y el de la voz de la app).
- **Resolución de los logos**: todos por encima de **300 dpi** en su tamaño impreso
  (el isologo municipal, a 1104 dpi; el más justo, el isotipo del Concejo a 320 dpi,
  que sólo aparece en la pieza de referencia `01b`, que no se imprime).

El detalle de medidas, colores, contrastes y decisiones está en
**`CARTELERIA.md`**; la lectura de la identidad municipal, en
**`carteleria/IDENTIDAD.md`**.
