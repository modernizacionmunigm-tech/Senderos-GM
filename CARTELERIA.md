# Cartelería — Senderos "Monte Mitre"

Plan de cartelería para los tres senderos del Monte Mitre (Municipalidad de
Guardia Mitre). La idea del proyecto: **carteles de inicio y meta, flechas
mínimas en los senderos, y todo lo demás resuelto con la app**.

Este documento es el plan para fabricar, instalar y mantener. Las medidas y los
textos están listos para mandar a la imprenta; lo que falta decidir está al
final, en "Decisiones pendientes".

---

## 1. Principios

1. **La cartelería orienta; la app guía.** El cartel da lo mínimo para no
   perderse y manda a la app. No se copia la app en un cartel.
2. **El cartel tiene que funcionar sin celular.** Nombre del sendero, color,
   flecha, distancia. El QR es un plus, no la única vía de información.
3. **Bajo impacto, no negociable.** No se pinta sobre rocas ni troncos, no se
   clava en árboles, no se abre senda nueva. Postes hincados sobre la huella que
   ya existe.
4. **Todo desmontable y reemplazable.** Cada placa es una pieza de repuesto, no
   una obra.
5. **Se lee parado, con sol, en 10 segundos.** Frases cortas, letra grande,
   alto contraste.

---

## 2. Los tres senderos (la cartelería debe coincidir con la app)

Los colores y la numeración **no se inventan**: son los mismos que usa la app.

| Sendero | Color | Distancia | Desnivel | Puntos numerados | Inicio | Meta |
|---|---|---|---|---|---|---|
| Monte Mitre — Baja | verde `#10B981` | 2,38 km | 15 m | 8 (1 a 8) | `-40.42588, -63.66577` | mismo punto (circuito) |
| Monte Mitre — Media | ámbar `#F59E0B` | 2,64 km | 36 m | 7 (1 a 7) | `-40.42572, -63.66564` | mismo punto (circuito) |
| Monte Mitre — Alta | rojo `#EF4444` | 2,68 km | 39 m | 7 (1 a 7) | `-40.4242735, -63.6655205` | `-40.4243372, -63.6656179` (a 11 m del inicio) |

Datos del relevamiento que definen el diseño:

- **Baja y Media arrancan a 21 m una de otra** → comparten el acceso. Ver 2.1.
- **Alta arranca 180 m al norte**, sobre el camino que los otros dos ya usan →
  se resuelve con una placa de desvío, no con otro cartel grande.
- **Alta cierra a 11 m de su inicio** → alcanza un poste con las dos placas
  (inicio de un lado, meta del otro). Verificar en terreno.
- La numeración de la app **no cuenta** el inicio (▶) ni la meta (■): los puntos
  arrancan en 1. Los carteles tienen que numerarse igual.

### 2.1 Una sola puerta, con dos cabeceras

Los tres recorridos salen de la misma zona de acceso (la del sur, camino del
pueblo), pero el relevamiento marca dos puntos de partida:

| Cabecera | Coordenadas | Quién arranca ahí |
|---|---|---|
| **Sur (la puerta)** | `-40.4258, -63.6657` | Baja y Media (a 21 m una de otra) |
| **Norte** | `-40.4243, -63.6655` | Alta (inicio y meta, a 11 m una de otra) |

La cabecera Norte está a **180 m** de la Sur y **a 5,5 m del trazado del circuito
Media** (a 26 m del punto 8 de la Baja). O sea: los tres ya pasan por el mismo
lugar; el Alta simplemente arranca 180 m más arriba, sobre el camino que los
otros dos usan para entrar.

Conclusión práctica: **un cartel grande abajo (la puerta) y placas chicas en cada
inicio real**. No hacen falta tres carteles grandes ni hay que crear una puerta
nueva.

### 2.2 ¿Y si queremos que los tres arranquen en el mismo punto?

Se puede, pero son dos cosas distintas:

- **Unificar lo que se comunica** (recomendado): la puerta de entrada al proyecto
  es la cabecera Sur, donde se estaciona y donde está el cartel grande. Nadie
  tiene que saber que el Alta arranca 180 m más arriba hasta que llega a la placa
  de desvío. **No se toca ningún dato.**
- **Unificar el trazado GPS** (no recomendado, salvo que haya carrera): mover el
  inicio del Alta a la cabecera Sur obliga a agregar el tramo de acceso al
  trazado, que se recorre **dos veces** (ida y vuelta). Eso suma ~360 m: el Alta
  pasaría de 2,68 km a ~3,04 km, habría que editar `app/src/data.ts`, recalcular
  distancia y desnivel, volver a dibujar el mapa (quedaría un circuito con un
  "mango") y revisar los tiempos del ranking.

**Recomendación: unificar la puerta sí, el GPS no.** El único caso que justifica
mover el trazado es que haya una **carrera con largada única**: ahí sí conviene
que los tres salgan del mismo punto para que el cronometraje sea justo.

---

## 3. El esquema: cuántas piezas y de qué tamaño

### 3.1 Esquema recomendado (simplificado)

La versión con menos plata, menos vandalismo y menos ruido visual: **un cartel de
"Senderos Monte Mitre" en la puerta y placas chicas en cada inicio**.

| Cód. | Tipo | Cant. | Medida | Dónde |
|---|---|---|---|---|
| **A** | **Cartel de Senderos (la puerta)** | 1 | **140 × 100 cm** | Cabecera Sur, junto al acceso/estacionamiento |
| **B/C** | **Placa de inicio y meta (doble cara)** | 3 | 25 × 20 cm | Inicio real de cada sendero (ver 2.1) |
| **F** | Reglamento / aviso | 1 | 60 × 45 cm | Cabecera Sur, al lado del cartel A |
| **D** | Punto de interés numerado (**sin QR**, ver 3.4) | 22 | 25 × 20 cm | Uno por punto, según el relevamiento |
| **E** | Flecha de orientación | ~8 (a relevar) | 30 × 10 cm | Bifurcaciones y desvío al Alta |

Total: **35 piezas**, y **una sola grande**.

Por qué funciona:

- El cartel grande concentra todo lo institucional (logos, mapa de los tres
  senderos, ordenanza, recomendaciones, emergencias) en un solo lugar: se ve una
  vez, bien, al llegar.
- Las placas de inicio son chicas y baratas. Si alguien las rompe, se repone una
  sola.
- La placa de inicio va **de doble cara**: de un lado "▶ EMPEZÁ ACÁ", del otro
  "¡LLEGASTE!" con el QR a Registrar Tiempo. Una pieza, dos funciones: eso
  elimina las 3 placas de meta del esquema anterior.
- En el Alta, esa misma placa hace de inicio y de meta (arranca y termina en el
  mismo poste).

### 3.2 Sobre "placas sólo con el QR"

Sí, pero no *sólo* el QR. La placa necesita tres cosas más, y no cuestan nada
porque es la misma pieza:

1. **El color y el nombre del sendero.** Si no, ¿cómo sé cuál es este?
2. **La flecha** del sentido de marcha.
3. **Distancia y dificultad**, en un renglón.

Un cartel que sólo tiene un QR deja a pie al que no tiene celular, al que se
quedó sin batería y al que no tiene datos. El QR sigue siendo el gancho: grande,
en el cartel de la puerta con la **URL escrita abajo**; en las placas chicas va
sólo el QR, porque la dirección completa **no entra legible en 25 cm de ancho**
(ver decisión 14 de la sección 11).

### 3.3 Esquema completo (si se hace por partes)

| Cód. | Tipo | Cant. | Medida placa | Dónde | Contenido principal |
|---|---|---|---|---|---|
| **A** | Pórtico de ingreso | 1 (2 si el Alta tiene el suyo) | **140 × 100 cm** | Acceso compartido Baja/Media | Mapa de los 3 senderos, QR grande, recomendaciones, emergencias |
| **B** | Inicio de sendero | 3 | 60 × 45 cm | Punto de partida de cada sendero | Nombre, color, distancia, desnivel, dificultad, flecha "EMPEZÁ ACÁ", QR |
| **C** | Meta | 3 | 45 × 30 cm | Cierre de cada sendero | "¡LLEGASTE!", distancia total, QR a Registrar Tiempo |
| **D** | Punto de interés numerado | 22 | 25 × 20 cm | Un cartel por punto, en la ubicación del relevamiento | Número grande, nombre del punto (los nombres ya existen), 1 línea de qué mirar |
| **E** | Flecha de orientación | 8 a 10 (a relevar) | 30 × 10 cm (o flecha sobre poste bajo) | Bifurcaciones, cruce de calle, retorno | Color + flecha + nombre corto ("ALTA →") |
| **F** | Reglamento / aviso | 2 | 60 × 45 cm | En los accesos | Cuidados del monte, ordenanza, contactos |
| **G** | Créditos institucionales | integrado | — | En el pórtico y en las metas | Municipalidad, Concejo, Deportes, estudiantes autores |

Total fase completa: **~40 piezas**. No hace falta hacerlas todas de una (ver
"Secuencia").

### Perforaciones a evitar

- **No** poner carteles en cada punto de interés "decorativos": 22 placas ya son
  mucho. El punto numerado es chico y seco a propósito.
- **No** poner QR en las 22 placas: sin service worker no sirven en el monte
  (ver 3.4) y multiplican la impresión y el vandalismo.

### 3.4 Dónde va el QR y dónde no (sin service worker)

Decisión tomada (oct 2026): **por ahora no se agrega service worker**, así que la
app **no arranca sin señal**. Consecuencia directa para la cartelería:

| Lugar | ¿QR? | Por qué |
|---|---|---|
| Cartel de Senderos (la puerta) | **Sí, grande** | Es donde hay señal y donde la gente se prepara |
| Placas de inicio | **Sí** | Para ver el recorrido antes de arrancar |
| Cara "¡LLEGASTE!" | **Sí** | Para registrar el tiempo al volver (ver 4.C) |
| Puntos numerados del monte | **No** | Sin señal, el QR no abre: sería un cartel que promete y no cumple |

O sea: **en el monte guía el cartel, no el celular.** Eso hace al sistema más
robusto (nadie depende de la batería) y más barato (22 placas sin QR).

Cuando se agregue el service worker, la app sí va a funcionar en el monte y ahí
tiene sentido poner el QR en los puntos (el pedido de `?poi=` ya está listo en
`PEDIDO-WEB-QR.md`, no bloquea nada).

### 3.5 El sistema visual: color, tipografía y bandas

Los mockups están en **`carteleria/mockups.html`** (abrir en el navegador): ahí
están las cinco piezas dibujadas a escala, con el **trazado real** de los tres
senderos tomado de las mismas coordenadas que usa la app. Los archivos están
construidos a **1 unidad = 1 mm**, así que sirven de base para los archivos de
imprenta.

**Una sola idea:** cada sendero es **su color y su banda**. Eso aparece igual en
el mapa, en el cartel, en la placa y en la app. Todo lo demás —texto, números,
logos— va en **negro sobre blanco**.

| Uso | Color | Hex |
|---|---|---|
| Tinta: todo el texto y los números | Negro | `#111111` |
| Fondo de todas las placas | Blanco | `#FFFFFF` |
| Datos secundarios y pies | Gris | `#6B7280` |
| Sendero Baja | Verde | `#10B981` |
| Sendero Media | Ámbar | `#F59E0B` |
| Sendero Alta | Rojo | `#EF4444` |

Blanco de fondo por tres razones: contrasta más, calienta menos al sol y envejece
mejor (el color impreso se destiñe; el blanco no). **El color se usa como dato,
no como adorno.**

**La regla del color, con números.** El color del sendero **nunca** se usa para
texto: se usa para campos de color y adentro va **texto negro**. La razón:

| Combinación | Contraste | ¿Se usa? |
|---|---|---|
| Negro sobre blanco | 19,3 : 1 | Sí — todo el texto |
| Negro sobre verde (Baja) | 8,2 : 1 | Sí — el número de punto |
| Negro sobre ámbar (Media) | 9,8 : 1 | Sí — el número de punto |
| Negro sobre rojo (Alta) | 5,6 : 1 | Sí — el número de punto |
| Blanco sobre verde | 2,6 : 1 | **No** |
| Blanco sobre ámbar | 2,2 : 1 | **No** |
| Ámbar sobre blanco (texto) | 2,2 : 1 | **No** |

Mínimo de accesibilidad: 4,5 : 1. Todo lo que se usa lo supera con margen. Ámbar
sobre blanco casi no se ve: por eso el número de punto va **negro sobre el color
del sendero**, y no al revés.

**Las bandas: el color no alcanza solo.** Verde y rojo son el peor par para el
daltonismo más común (afecta a 1 de cada 12 hombres). Por eso cada sendero tiene,
además del color, **una cantidad de franjas distinta**:

| Sendero | Franjas | Se distingue en |
|---|---|---|
| Baja | **1 franja** | color, blanco y negro, y de lejos |
| Media | **2 franjas** | color, blanco y negro, y de lejos |
| Alta | **3 franjas** | color, blanco y negro, y de lejos |

Las franjas van separadas por huecos blancos del mismo grosor que la franja. Se
imprime igual de fácil que un color plano y no depende del color para funcionar.

**Tipografía.** Las mismas dos de la app, para que el cartel y la pantalla se
parezcan:

| Uso | Tipografía | Alto de letra | Se lee a |
|---|---|---|---|
| Título del cartel | Space Grotesk 700 | 76 mm | 25 m |
| Nombre del sendero (placa) | Space Grotesk 700 | 52 mm | 12 m |
| Número de punto | Space Grotesk 700 | 58 mm | 15 m |
| Títulos chicos | Space Grotesk 600 | 15 a 30 mm | 4 a 8 m |
| Datos (km, desnivel) | Inter 500 | 12 a 13 mm | 3 m |
| Pies y créditos | Inter 400 | 8 a 10 mm | 1 m |

Regla práctica usada para calcular: **25 mm de alto de letra por cada 10 m de
distancia**. Las dos tipografías son libres (Google Fonts): no hay que comprar
licencias.

**Qué lleva cada pieza, y qué no:**

- La **banda** de las placas chicas lleva, en negro, la línea institucional
  ("MUNICIPALIDAD DE GUARDIA MITRE") alineada a la derecha. Es espacio que ya
  estaba muerto y evita sumar un renglón.
- Las **placas chicas no llevan logos**: los cuatro logos institucionales van en
  el cartel de la puerta y en el de reglamento. Repetirlos en 25 placas no suma y
  encarece la impresión.
- El cartel de la puerta lleva **mapa geográfico, no diagrama**: se dibuja el
  trazado real y el norte arriba. Un plano estilizado sería más "lindo", pero en
  el monte la gente necesita saber dónde está de verdad.
- Las **recomendaciones extensas** van en el cartel de reglamento (pieza F). En la
  puerta va sólo un recordatorio de una línea.

**Por qué el cartel de la puerta pasó de 120 × 80 a 140 × 100 cm:** a 120 × 80 el
mapa, la leyenda de los tres senderos, el QR y las recomendaciones no entran con
letra legible (probado con los mockups). Son 0,4 m² más **en una sola pieza** y el
ingreso queda resuelto de una vez.

---

## 4. Textos listos para la imprenta

### A. Pórtico de ingreso

```
                    SENDEROS MONTE MITRE
        Municipalidad de Guardia Mitre · Trazados relevados con GPS

   [ Mapa de los 3 senderos, con su color y su nombre ]

   ┌──────────┐   Escaneá y llevá el mapa, la guía de flora
   │   QR     │   y el registro de tiempos en el celular
   └──────────┘   senderos.guardiamitre.gob.ar  ← (URL a definir)

   ELEGÍ TU SENDERO (el mapa tiene los colores)
     ● BAJA   2,38 km   desnivel 15 m   fácil, familiar
     ● MEDIA  2,64 km   desnivel 36 m   intermedio
     ● ALTA   2,68 km   desnivel 39 m   exigente, no apto para chicos

   ANTES DE ARRANCAR
     · Con señal: abrí la app acá y mirá el mapa de tu sendero
       (en el monte no hay señal: guiate por los carteles)
     · Llevá agua, gorra y calzado cerrado
     · No arranques plantas, no te lleves piedras ni semillas
     · Volvé con tu basura
     · Con viento fuerte o tormenta, suspendé el recorrido

   EMERGENCIAS: 911 · (teléfonos locales a confirmar)

   Espacio natural protegido. Cuidamos el monte entre todos.
   Ordenanza Nº ▢▢
```

### B. Inicio de sendero (ejemplo: Baja)

```
   ███ BANDA: 1 franja verde ███  +  MUNICIPALIDAD DE GUARDIA MITRE (derecha)

   BAJA                             ← Space Grotesk 700, 52 mm

   2,38 km · desnivel 15 m

   ▶ EMPEZÁ ACÁ  (flecha grande apuntando al sentido de marcha)

   ┌──────────┐  Escaneá el mapa
   │   QR     │  (74 × 74 mm, sin URL escrita: no entra legible)
   └──────────┘
```

Para **Media** y **Alta** igual, cambiando color, franjas (2 y 3) y datos:
Media → 2,64 km · desnivel 36 m. Alta → 2,68 km · desnivel 39 m.

> En la placa de 25 × 20 entra esto y nada más. Lo que no entra —"Circuito
> cerrado: volvés al mismo lugar" y el aviso del Alta ("subidas fuertes, no apto
> para chicos pequeños")— va al **cartel de reglamento (F)**: en la placa chica no
> hay lugar, y en el cartel de la puerta tampoco, porque la leyenda de los tres
> senderos tiene que quedar pareja.

### C. Meta (es el dorso de la placa B)

```
   ███ BANDA: las franjas del sendero ███  +  MUNICIPALIDAD DE GUARDIA MITRE

   ¡LLEGASTE!                       ← Space Grotesk 700, 38 mm

   Completaste el sendero BAJA

   ┌──────────┐  REGISTRÁ
   │   QR     │  TU TIEMPO
   └──────────┘  cuando vuelvas al pueblo
                 Dejalo como lo encontraste.
```

> En el esquema simplificado (3.1), **B y C son la misma pieza**: la placa de
> inicio de 25 × 20 cm lleva "▶ EMPEZÁ ACÁ" de un lado y "¡LLEGASTE!" + QR a
> Registrar Tiempo del otro. Mismos textos, sólo se achican.

### D. Punto de interés numerado (ejemplo: Alta punto 3)

```
   ┌───────┐
   │   3   │   ← número grande, 58 mm de alto, NEGRO sobre el color del
   └───────┘      sendero (ver 3.5: en color no se lee)

   EL CAÑÓN DE LA TORTURA
   Paso estrecho esculpido por las lluvias entre dunas arenosas.
   A 1,07 km del inicio

   Punto 3 de 7 · Sendero ALTA

   Buscá en la zona: jarilla, alpataco   ← engancha con la guía de flora de la app
```

> Las placas de los puntos **no llevan QR** (ver 3.4). El número es lo que las
> conecta con la app: en el mapa, el punto 3 del sendero Alta es el número 3.
>
> La banda superior de la placa (1, 2 o 3 franjas) dice de qué sendero es, y en
> esa misma banda va, en negro, la línea institucional "MUNICIPALIDAD DE GUARDIA
> MITRE" alineada a la derecha (ver 3.5).

Los nombres y las descripciones de los 22 puntos ya están escritos en
`app/src/data.ts` (campos `pointsOfInterest`). **Usar esos mismos textos**, para
que el cartel y la app digan lo mismo.

### E. Flecha de orientación

```
   ● ALTA →        (flecha + color del sendero; nada más, se lee corriendo)
```

### F. Reglamento / aviso

```
   ESTE ES UN ESPACIO NATURAL. CUIDALO.

   · No arranques ni pises la vegetación nativa
   · No arranques cactus, no te lleves semillas ni piedras
   · Nada de fuego
   · Perros con correa
   · Residuos: volvés con ellos
   · No entres en vehículo al sendero
   · Si ves una rotura o un cartel caído, avisá: (teléfono a confirmar)
```

---

## 5. Estrategia de QR (la parte fina)

### 5.1 Qué URL va en cada QR

La app vive en `https://modernizacionmunigm-tech.github.io/Senderos-GM/` y ya
acepta deep links por `?tab=`:

| QR | URL | Estado |
|---|---|---|
| Pórtico / genérico | `.../Senderos-GM/?tab=senderos` | **funciona hoy** |
| Mapa | `.../Senderos-GM/?tab=mapa` | **funciona hoy** |
| Registro de tiempo (meta) | `.../Senderos-GM/?tab=tiempos` | **funciona hoy** |
| Guía de flora (en los puntos) | `.../Senderos-GM/?tab=biodiversidad` | **funciona hoy** |
| Inicio de un sendero en particular | `.../Senderos-GM/?tab=mapa&sendero=alta` | **ya funciona** |
| Un punto puntual | `.../Senderos-GM/?tab=mapa&sendero=alta&poi=3` | **pedido pendiente** |

El `?sendero=` ya está implementado en `app/src/App.tsx` (~línea 50) y acepta
`baja`, `media`, `alta` o el id completo. Falta `?poi=`: el pedido con la spec,
la implementación sugerida y los criterios de aceptación está en
**`PEDIDO-WEB-QR.md`**, para hacerlo en la sesión donde se trabaja la web.

Conviene **resolver el `?poi=` antes de imprimir**, porque define si las placas
de los puntos llevan QR o no.

> ⚠️ Con el esquema simplificado, que el `?sendero=` exista es lo que salva todo.
> Al lado de la puerta quedan las placas de Baja y Media a 21 m una de otra: si
> los tres QR apuntaran al mismo lugar, serían el mismo cartel tres veces. El
> parámetro `sendero=` es lo único que le dice a la app cuál de los tres abrir.

> ⚠️ **Offline:** decisión tomada (oct 2026): **no se agrega service worker por
> ahora**, así que el sitio **no arranca sin señal** y **en ningún cartel va la
> palabra "sin señal"**. Dónde va QR y dónde no: sección 3.4. Cuando se agregue
> el service worker no cambia ninguna URL, así que se puede hacer más adelante
> sin tocar la cartelería impresa.

### 5.2 Reglas de oro del QR

1. **Una URL nunca se cambia.** Si cambia el dominio, quedan 40 QR muertos.
   Conviene registrar una URL corta propia (por ejemplo
   `senderos.guardiamitre.gob.ar`) que redirija: así los carteles viven años.
2. **Negro sobre blanco, mate.** Nunca QR sobre el color del sendero, sobre
   foto ni sobre fondo con textura.
3. **Con zona blanca alrededor** (el "silencioso") de al menos 4 módulos.
4. **Tamaños (los que entran en el diseño):** **200 × 200 mm** en el cartel de la
   puerta, **88 × 88 mm** en la cara de inicio y **80 × 80 mm** en la cara de
   "¡LLEGASTE!" de las placas (lo máximo que entra sin achicar el nombre del
   sendero). Más chico que eso, deja de leerse de pie: hay que probarlo. **En los
   puntos numerados no va QR** (ver 3.4).
5. **Si se pone el isologo adentro**, usar corrección de errores alta (H) y
   probar el escaneo antes de imprimir todo.
6. **Poner la URL escrita abajo del QR**, en letra legible, para quien no puede
   escanear o tiene el celular sin batería.

### 5.3 El problema de la señal (muy importante)

Escanear un QR no gasta datos, pero **abrir la app en el monte falla sin señal**:
hoy no hay service worker y la decisión es no agregarlo por ahora (ver 3.4).

Por eso el QR se usa **en el ingreso y en la meta** (donde la persona se prepara
o vuelve), y **el monte se navega con los carteles y las flechas**. El banner de
instalación de la app (`PWAInstallBanner.tsx`) **ya no promete uso sin señal**:
se corrigió en octubre de 2026 (ahora invita a instalarla para acceder más rápido
y avisa que en el monte puede no haber señal).

### 5.4 Protocolo de prueba

Antes de fabricar todo: imprimir **una** muestra, llevarla al monte y escanearla
con un celular viejo, a 1,5 m de distancia, a pleno sol y con el ángulo real de
montaje. Recién ahí mandar el resto a producción.

---

## 6. Lista de replanteo (para ir al terreno con GPS)

Coordenadas del relevamiento existente (`app/src/data.ts`). Van tal cual: son
los puntos donde debe ir cada placa.

### Sendero Baja (verde)

| Nº | Nombre en la app | Latitud | Longitud | Placa |
|---|---|---|---|---|
| ▶ | Inicio / Meta del Sendero | -40.42588 | -63.66577 | B + C (una placa doble) |
| 1 | Entrada al sendero | -40.42398 | -63.66461 | D |
| 2 | Cañadón | -40.42215 | -63.66568 | D |
| 3 | Segundo cañadón | -40.42095 | -63.66674 | D |
| 4 | Salida a calle | -40.42034 | -63.66787 | D + flecha |
| 5 | Entrada sendero de vuelta | -40.41845 | -63.66365 | D + flecha |
| 6 | Salida del sendero | -40.42296 | -63.6614 | D + flecha |
| 7 | Cementerio | -40.42362 | -63.66271 | D (color especial, punto histórico) |
| 8 | Sendero baja intensidad a la derecha | -40.4244 | -63.66526 | D + flecha |

### Sendero Media (ámbar)

| Nº | Nombre en la app | Latitud | Longitud | Placa |
|---|---|---|---|---|
| ▶ | Inicio / Meta del Sendero | -40.42572 | -63.66564 | B + C |
| 1 | El primer repecho | -40.42426 | -63.66659 | D |
| 2 | El arenal largo | -40.42027 | -63.66718 | D |
| 3 | La vuelta del viento | -40.41957 | -63.66651 | D + flecha |
| 4 | El bajo del zorro | -40.42085 | -63.66863 | D |
| 5 | La sombra del chañar | -40.42308 | -63.66872 | D |
| 6 | El filo del este | -40.42316 | -63.66463 | D + flecha |
| 7 | La recta de casa | -40.42404 | -63.66571 | D |

### Sendero Alta (rojo)

| Nº | Nombre en la app | Latitud | Longitud | Placa |
|---|---|---|---|---|
| ▶ | Inicio del Sendero | -40.4242735 | -63.6655205 | B |
| 1 | La subida al cielo | -40.4220775 | -63.6660302 | D |
| 2 | El desierto desesperante | -40.4195423 | -63.6686721 | D |
| 3 | El cañón de la tortura | -40.4184805 | -63.6712497 | D |
| 4 | No te preocupes no es tan difícil | -40.4195587 | -63.6731092 | D |
| 5 | El salto al vacío | -40.4212086 | -63.6728564 | D (aviso de descenso técnico) |
| 6 | La quebrada oscura | -40.4217543 | -63.669491 | D |
| 7 | El empuje final | -40.423986 | -63.6686247 | D |
| ■ | Meta - Fin del Recorrido | -40.4243372 | -63.6656179 | C |

Pendiente de relevamiento en terreno: **ubicación de las flechas** en
bifurcaciones, dónde queda el acceso vehicular/estacionamiento y si el poste de
inicio del Alta sirve también como meta.

---

## 7. Materiales y montaje

### Placas

| Opción | Pro | Contra |
|---|---|---|
| **ACM (aluminio compuesto) 3 mm + impresión UV + laminado mate** | liviano, no se oxida, resiste viento y sol, colores firmes | más caro |
| **Chapa galvanizada pintada** con esmalte sintético | económico, muy resistente | hay que repintar cada tanto |
| PVC expandido | barato y liviano | se degrada con UV, se quiebra |
| ❌ Acrílico | — | se rompe con granizo, frío y una piedra |
| ❌ MDF / madera enchapada | — | se hincha con la humedad |
| ❌ Vinilo solo, sin placa | — | se despega con el sol y el viento |

### Postes

- Caño estructural galvanizado 1¼" o madera dura tratada.
- Hincado 60-70 cm. En médano, anclaje a tornillo de tierra (menos intervención
  que hormigón).
- Para los puntos de interés: **poste bajo de ~1,20 m**. Nada alto, no compite
  con el paisaje ni se lleva el viento.

### Montaje

- Tornillos **pasantes con separador**: deja aire entre placa y poste y evita que
  se acumule arena y humedad. Nada adhesivo (el viento y el frío lo matan).
- Tornillos antivandálicos (torx) — la cartelería de senderos siempre sufre.
- **Inclinación de 10 a 15°** hacia atrás: reduce reflejo y acumulación de arena.
- Altura al centro del QR: **~1,40 m**.
- **Orientación:** que la cara del QR mire al **sur o sudeste**, nunca al norte.
  A 40° de latitud sur el sol pega todo el día del norte y el reflejo anula el
  contraste.
- Cantos sellados; la arena patagónica es abrasiva y la humedad entra por los
  bordes.

### Tipografía

Es la de la app, **Space Grotesk** (títulos y números) + **Inter** (texto): los
tamaños, la escala y las reglas están en **3.5**. Las dos son libres (Google
Fonts), así que no hay licencias que comprar.

Para el imprentero:

- Archivos **SVG a tamaño real en milímetros** (los mockups ya están construidos
  así: 1 unidad = 1 mm).
- O se le pasan las fuentes, o se **convierten las letras a curvas** antes de
  mandar. Las dos opciones son válidas; conviene preguntarle al taller.
- **Sangrado 5 mm** y las franjas de color a sangre.

### Bajo impacto

- Fijar siempre sobre el claro/huella que ya existe.
- Nunca en árboles, nunca pintura sobre rocas.
- Excavación mínima y rellenada.
- Coordinar con el área de ambiente antes de hincar en médano.

---

## 8. Secuencia de trabajo (no hacer todo junto)

**Fase 0 — Cerrar decisiones** (ver sección 11). Sin esto, no se imprime.

**Fase 1 — Cartelería mínima "inaugurable"** (5 piezas):
el cartel de Senderos (la puerta), 1 de reglamento y las 3 placas de
inicio/meta. Con esto el proyecto ya se puede presentar y recorrer. Es un solo
cartel grande: si el presupuesto no alcanza, esta fase sola ya deja el ingreso
resuelto.

**Fase 2 — Los 22 puntos numerados.** Es la que hace que la gente use la app.

**Fase 3 — Flechas y ajustes.** Salir a recorrer los tres senderos, marcar dónde
falta una flecha de verdad, e instalarlas.

**Fase 4 — Mantenimiento y repuestos.** Guardar 2 o 3 placas de cada tipo.

---

## 9. Costos (a cotizar)

No pongo números cerrados porque cambian mes a mes. Lo que sí conviene: **pedir
cotización por m² de ACM impreso** (es el insumo que manda) y calcular así, con
el esquema simplificado (3.1):

| Pieza | Medida | m² | Cantidad | m² totales |
|---|---|---|---|---|
| Cartel de Senderos (la puerta) | 120 × 80 cm | 0,96 | 1 | 0,96 |
| Reglamento / aviso | 60 × 45 cm | 0,27 | 1 | 0,27 |
| Placa de inicio/meta (doble cara) | 25 × 20 cm | 0,05 | 3 | 0,15 |
| Punto numerado | 25 × 20 cm | 0,05 | 22 | 1,10 |
| Flecha | 30 × 10 cm | 0,03 | 8 | 0,24 |
| | | | **35 piezas** | **~2,7 m² de placa** |

La diferencia con el esquema completo es grande: se pasa de ~5,1 m² y tres
piezas grandes a **~2,7 m² y una sola pieza grande**. Ojo con el doble cara: cotizar
la impresión de las dos caras en esas 3 placas.

A eso sumar: postes, tornillería antivandálica, hincado/mano de obra, y el
**prototipo de prueba** (que no se saltea).

---

## 10. Mantenimiento

- Responsable: definir (Área de Deportes / Delegación municipal).
- Recorrida visual **cada 3 meses** y después de cada temporal de viento.
- En cada cartel, teléfono para avisar roturas o grafitis.
- Limpieza con agua y trapo húmedo. **Nunca trapo seco**: la arena raya.
- Repuestos: 2 o 3 piezas de cada tipo guardadas.

---

## 11. Decisiones pendientes (para cerrar antes de imprimir)

1. **Número de ordenanza** y autoridad de aplicación, para citarla en el cartel.
2. **Teléfonos de emergencia locales** (911 es nacional, pero confirmar
   Bomberos, hospital/delegación y Defensa Civil). No inventarlos.
3. **Dominio o URL corta** para los QR. ¿Se registra uno propio?
4. **¿Se aprueba el cambio de deep link** en `App.tsx` (`?sendero=` y `?poi=`)?
   **Con el esquema simplificado es obligatorio** (ver 5.1). Define el contenido
   impreso de los QR.
5. **¿Dónde se estaciona?** Sin eso, el cartel de la puerta está incompleto.
6. **Nombres definitivos**: hoy la app dice "Monte Mitre - Dificultad Baja /
   Media / Alta". Si el cartel va a usar otros nombres (por ejemplo "Sendero
   Verde"), hay que cambiarlos **en la app primero**.
7. **¿Quién financia y quién paga el mantenimiento?**
8. **Permiso de ambiente** para hincar postes en el médano.
9. **¿Hay acto de inauguración?** Si sí, prever cartelería efímera (banners) y
   el orden de instalación por fases.
10. **Verificar en terreno** que el poste de inicio del Alta sirve como meta
    (están a 11 m) y que el circuito cierra del todo.
11. **¿Se unifica físicamente el arranque de los tres?** Ver 2.2. Recomendación:
    no tocar los trazados, salvo que haya una carrera con largada única.
12. **¿Hay carrera o competencia prevista?** Si la hay, cambia el diseño: hace
    falta una largada común, cronometraje y cartelería efímera.
13. **El logo del proyecto dice "ALTA Y BAJA"** (`app/src/assets/images/logo-senderos.png`)
    y hoy los senderos son **tres** (baja, media, alta). En un cartel de 1,4 m se
    nota. Opciones: actualizar el logo, o no usar ese lockup en la cartelería.
    **Apareció al armar los mockups.**
14. **La URL completa no entra legible en las placas de 25 × 20 cm**
    (`modernizacionmunigm-tech.github.io/Senderos-GM/?tab=mapa&sendero=baja` ocupa
    más que el ancho de la placa a un tamaño legible). Opciones: (a) dejar sólo el
    QR en las placas y la dirección escrita únicamente en el cartel de la puerta,
    (b) registrar una **URL corta municipal** que entre en las dos. Recomendado:
    (b), y mientras tanto (a).
15. **¿Se aprueba el paso a 140 × 100 cm** del cartel de la puerta (ver 3.5)?
    Es la única pieza grande del sistema.
16. **Los QR definitivos** se generan recién cuando estén las URLs cerradas, y se
    prueban **impresos y al sol** con un celular viejo antes de mandar las 35
    piezas. Las URLs, una vez impresas, no se cambian.

---

## 12. Ideas que suman poco costo y mucho uso

- **Cartel de "punto de foto"** en 2 o 3 lugares lindos: la gente lo comparte y
  el proyecto se difunde solo.
- **Referencia a la flora en cada punto numerado**: "Buscá: jarilla, alpataco".
  La guía ya tiene 8 especies cargadas (jarilla, sauce criollo, cardenal
  amarillo, choique, alpataco, carancho, bicho cesto, hongo de arenal).
- **En la meta, un QR extra** a "Dejá tu comentario" para juntar devoluciones.
- **Un QR al reglamento/comunicados** en el pórtico, para que el municipio pueda
  ir actualizando avisos sin reimprimir.
- **Sello o código por sendero** en cada meta, para los que quieren "coleccionar"
  los tres recorridos.
