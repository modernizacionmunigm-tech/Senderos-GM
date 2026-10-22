# Evolución del proyecto — ideas anotadas

> Nada de esto está hecho ni aprobado. Es lo que charlamos con la
> Municipalidad (oct 2026) y quedó **para después**. Cuando se decida avanzar
> con alguna, se pasa a un plan concreto (alcance, tiempos, costos) y recién
> ahí se toca el código.

---

## 1. Circuito grande: costanera, pista de salud y bici

**Estado: para después.** El usuario pidió dejarlo anotado como proyecto futuro
o como evolución del proyecto, no hacerlo ahora.

### La idea

Además de los senderos de las bardas (Monte Mitre), hay otros sectores que se
podrían sumar:

- El **paseo de la costanera** (junto al río).
- La **futura pista de salud**.
- Circuitos de **bicicleta**.

Están cerca del río (no de las bardas) pero **se comunican** con los senderos.
La idea final es armar **un circuito grande** que conecte todo, y que después
se pueda usar en eventos como **Guardia Corre** (la carrera del año).

### Cómo se armaría (propuesta)

No meter todo dentro de "Monte Mitre Senderos". Armar un **paraguas** con
familias:

| Familia | Qué incluye | Estado |
|---|---|---|
| **Monte Mitre** | los tres senderos de las bardas, señalizados | hecho |
| **Costanera / Río** | paseo, pista de salud, bici | a relevar |
| **Conectores** | tramos que unen el pueblo con las bardas | a relevar |

Técnicamente la app ya está armada alrededor de una lista de senderos
(`TRAILS` en `app/src/data.ts`). Habría que agregarle:

- **Tipo de circuito**: senderismo / trekking / bici / salud.
- **Conexiones** entre circuitos, para poder armar un recorrido combinado.
- Un mapa que muestre todo junto y permita elegir "circuito completo" o un
  tramo.

### Para Guardia Corre

No hace falta otra app. Se define un **circuito oficial del año**, con:

- su trazado,
- su QR (deep link),
- su ranking y su fecha,
- y un "modo evento" (largada, categorías, resultados).

Es **configuración**, no desarrollo nuevo.

### Fases sugeridas

1. Recorridos propuestos por la comunidad (ver punto 2).
2. Relevar costanera y pista de salud con GPS (igual que los KMZ de los
   senderos: se camina con el celular y se guarda el trazado).
3. Circuito grande + modo evento Guardia Corre.

### Decisión pendiente antes de arrancar

**¿El paraguas sigue llamándose "Monte Mitre Senderos" o pasa a otro nombre?**
(de ejemplo: "Circuitos Guardia Mitre" o "Guardia Mitre en movimiento").
Eso define logo, cartelería y QR: hay que decidirlo **antes** de imprimir nada.

---

## 2. Recorridos propuestos por la gente (virtuales)

**Estado: idea, sin decidir.**

### La idea

Que una persona pueda **grabar su recorrido con el GPS y proponerlo** para que
se publique en la app. Serían recorridos **solo virtuales**: sin cartelería,
sin mantenimiento municipal, y **publicados únicamente si se aprueban**.

### Cómo se armaría (propuesta)

- Botón **"Proponer un recorrido"** en el mapa: se graba con el GPS (la
  grabación ya existe), se pone nombre, dificultad estimada, descripción,
  punto de inicio y una foto si se quiere, y se aceptan las condiciones.
- Queda **pendiente en una planilla** con estado: *pendiente / aprobado /
  rechazado* + motivo. Se aprueba desde ahí: **no hace falta tocar código ni
  republicar la web**.
- Se publica con etiqueta de **"Recorrido de la comunidad"** (otro color, otro
  ícono) y un aviso: *no está señalizado, no tiene mantenimiento municipal,
  usalo con precaución*.
- **Fuera del ranking oficial** (o con un ranking aparte que diga "no
  oficial"), porque el ranking compara tiempos en recorridos medidos.
- Validación mínima antes de publicar: distancia razonable, inicio y fin
  claros, que no cruce el río ni la ruta, y revisión humana.

### El riesgo a tener en cuenta

**Responsabilidad**: si la Muni publica un recorrido y alguien se lastima,
queda expuesta. Por eso la etiqueta, las condiciones y la revisión no son
burocracia: son la protección del municipio. Antes de implementar conviene que
lo vea el área legal.

---

## 3. Clima: mejorar la fuente

**Estado: hecho lo básico; esto queda pendiente.**

Hoy el clima sale de **Open-Meteo** (API pública, sin clave), con las
coordenadas del pueblo y la hora del dato a la vista.

Limitación conocida: es un **modelo global de ~9 km**, así que una llovizna
fina puede no aparecer (comprobado el 21/10/2026: decía "nublado, 0 mm" con
llovizna en el pueblo). MET Norway daba lo mismo.

Opciones para cuando se retome:

- **Pronóstico de las próximas horas** ("puede llover a las 13"), que sirve
  más que el estado actual para decidir si salir.
- **SMN oficial** (Servicio Meteorológico Nacional): tiene API, pero hay que
  registrarse y pedir una clave a nombre de la Municipalidad.

---

## 4. Pendientes técnicos menores

- `?poi=` en la URL, para que un QR abra un punto puntual del sendero.
- Perfiles de elevación (hoy solo está el desnivel total).
- Compartir el resultado de una marca y el puesto en la tabla.
- Ranking histórico: guardar los primeros puestos de cada mes y armar una tabla
  general del año a fin de año. El ranking público ya funciona por mes
  calendario; la planilla conserva todo el historial.
- Service worker para arrancar sin señal (decidido no hacerlo por ahora).
