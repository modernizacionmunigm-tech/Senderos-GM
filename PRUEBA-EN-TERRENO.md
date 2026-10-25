# Prueba en terreno — Senderos Monte Mitre

> Checklist para recorrer los senderos con el teléfono y verificar que la app
> marque bien, y que el trazado y la partida estén correctos.
> Complementa `CARTELERIA.md` (sección 2) y `AGENTS.md`.

---

## 1. Antes de salir (10 minutos, en casa o con señal)

- [ ] **Batería al 100 %** y, si se puede, **batería portátil**. Grabar GPS
      con pantalla encendida come batería rápido.
- [ ] Abrir el sitio en el celular:
      https://modernizacionmunigm-tech.github.io/Senderos-GM/
- [ ] **Permiso de ubicación en "Precisa"** (no "Aproximada").
      En el mapa, si aparece el aviso ámbar de "Ubicación aproximada", tocar
      **"¿Cómo lo activo? Paso a paso"** y seguir los pasos.
- [ ] Entrar a **Mapa**, poner **nombre y categoría** (se guardan; no los vuelve
      a pedir). Así la tarjeta del final ya viene completa.
- [ ] **Elegir el sendero** en el mapa (sin sendero elegido no valida puntos ni
      deja cargar el tiempo).
- [ ] Instalar una **segunda app que grabe GPX** (ver sección 4). Abrirla y
      dejarla lista.
- [ ] Anotar acá el **911 / contacto** y a quién avisarle que vas.

---

## 2. Lo de la partida (esto hay que confirmarlo en el terreno)

El relevamiento GPS marca **dos cabeceras**, no una sola (ver `CARTELERIA.md` 2.1):

| Sendero | Inicio (coordenadas) | Cómo cierra |
|---|---|---|
| **Baja** (verde) | `-40.42588, -63.66577` (cabecera **Sur**) | mismo punto (circuito) |
| **Media** (ámbar) | `-40.42572, -63.66564` (cabecera **Sur**) | mismo punto (circuito) |
| **Alta** (rojo) | `-40.4242735, -63.6655205` (cabecera **Norte**) | meta a ~11 m del inicio |

Datos ya calculados:

- Baja y Media arrancan **a 21 m una de otra** → misma puerta (Sur).
- El Alta arranca **180 m al norte**, sobre el mismo camino de ingreso que usan
  las otras dos, y su cabecera pasa **a ~5,5 m del trazado del Media**.
- El Alta **cierra a ~11 m de su inicio** → un poste con dos placas
  (inicio de un lado, meta del otro). **Esto dice el mapa; hay que verlo.**

**Qué confirmar a pie:**

- [ ] ¿Hay **una sola puerta** física de acceso o dos? Marcar la ubicación real
      con la app de GPX (waypoint) y anotarla.
- [ ] ¿La cabecera Sur (cartel grande) está donde conviene estacionar?
- [ ] ¿El inicio del Alta está de verdad **180 m más arriba**, sobre ese mismo
      camino? ¿Se llega caminando por el camino de los otros dos?
- [ ] ¿La **meta del Alta** queda a ~11 m del inicio (para el poste doble)?
- [ ] ¿Se ve el desvío al Alta desde el camino? (para la placa de flecha)

> Decisión ya tomada (recomendada): **unificar lo que se comunica** (una sola
> puerta Sur), **sin tocar el GPS**. Solo si hubiera una **carrera con largada
> única** convendría mover el inicio del Alta (implica sumar ~360 m y recalcular
> distancia, desnivel, mapa y ranking). No lo hagas por la prueba.

---

## 3. Durante el recorrido

Grabar en la app **y** en la app de GPX al **mismo tiempo** (anotá la hora de
largada). Mientras caminás, mirá y anotá:

- [ ] **"Puntos validados: X de N"** va subiendo. N es 8 (Baja) o 7 (Media/Alta).
- [ ] Cada punto **valida al pasar a menos de 30 m**. Si te parás *encima* del
      cartel y **no** valida → la coordenada del punto está mal o el radio es
      chico. Anotá cuál.
- [ ] **Aviso "Fuera del sendero"** (sale a más de 40 m, solo con GPS bueno).
      Si aparece **estando sobre el sendero**, la línea del mapa está corrida o
      el camino real cambió. Anotá **dónde** (referencia del terreno).
- [ ] **Precisión GPS** que muestra el mapa (± metros). Si pasa de ±50 m, el
      aviso de desvío no se dispara (a propósito, para no dar falsas alarmas).
- [ ] Ubicación real de cada cartel/punto emblemático, si difiere del mapa.

### Ficha por sendero (llenar uno por recorrido)

| Punto | ¿Validó? (sí/no) | ¿Coincide con el terreno? | Nota |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |
| 7 | | | |
| 8 (solo Baja) | | | |

- Desvíos falsos (dónde): ______________________________________
- Tramo distinto a lo dibujado: _______________________________
- Otros: ______________________________________________________

---

## 4. La app de respaldo (sí, conviene llevarla)

**Por qué:** la app **no guarda** el recorrido hasta que lo terminás (queda en
el teléfono recién al tocar "Detener" o al cerrar el circuito). Si el navegador
se recarga, se cierra la pestaña o el teléfono se queda sin batería, **el
trazado grabado se pierde**. Además la app **no arranca sin señal** (no hay
service worker). Una segunda app te cubre las dos cosas y te da un **GPX** para
corregir `app/src/data.ts` con precisión.

Recomendadas (cualquiera que exporte **GPX con fecha/hora**):

- **Android:** GPX Viewer, Geo Tracker, OsmAnd. (Strava también exporta GPX.)
- **iPhone:** GPX Tracker, Open GPX Tracker, WorkOutDoors.

Recomendaciones de uso:

- [ ] Poner la app de GPX a grabar **antes** de apretar "Grabar Recorrido".
- [ ] Dejar el **GPS en máxima precisión**; esperar a que fije satélites
      (unos segundos a cielo abierto) antes de largar.
- [ ] Marcar **waypoints** en: cada inicio real, cada cartel dudoso, la meta.
- [ ] Al terminar, **exportar el GPX** y guardarlo (Drive/WhatsApp/email).

---

## 5. Al terminar

- [ ] ¿La app **frenó el cronómetro sola** al cerrar el circuito (Baja/Media) o
      al llegar a la meta (Alta)?
      Para que cierre, exige: **todos** los puntos + volver a **≤50 m del
      inicio** (o llegar a la meta) + **≥80 %** de la distancia hecha.
      Si no cerró, anotá: puntos validados ___ de ___, distancia hecha ___ %,
      a qué distancia quedaste del inicio/meta: ___ m.
- [ ] ¿Guardó el recorrido en **"Mis recorridos"**? ¿La distancia y el tiempo
      que muestra coinciden con el GPX de respaldo?
- [ ] Cargar la marca al ranking (o probar que quede **en cola** sin señal y
      suba sola después, al volver la conexión).
- [ ] Comparar el **tiempo de la app** con el del GPX: deberían parecerse.

---

## 6. Qué hacer con lo que encuentres

1. **Un punto no valida donde debería** → corregir su `lat`/`lng` en
   `app/src/data.ts` (o subir el radio de 30 m en `MapModule.tsx`, hoy fijo).
2. **El trazado está corrido o cambió** → exportar el GPX, extraer los vértices
   y reemplazar el arreglo `coordinates` del sendero en `data.ts`. Recalcular
   `distance` y `elevationGain` del comentario de cabecera.
3. **La partida no es como la pinta el mapa** → corregir la tabla de
   `CARTELERIA.md` (2.1) y, si cambia el inicio, ajustar `startPoint` y el POI
   `inicio` en `data.ts`. Ojo: la copia de Media dice que comparte la partida
   con los otros dos; si el Alta tiene otra cabecera, ese texto hay que
   revisarlo.
4. Anotar todo **en el repo**, no solo en el chat: `AGENTS.md` (estado) o este
   archivo.

---

## 7. Chuleta para el celular

```
1. Ubicación PRECISA  ->  2. Mapa: nombre + categoría + elegir sendero
3. Prender GPX de respaldo
4. Grabar (app + GPX) al mismo tiempo
5. Mirar "Puntos validados X de N" y avisos de desvío
6. Confirmar la partida (Sur Baja/Media · Norte Alta) y las metas
7. Al cerrar: ¿frenó solo? ¿coincide con el GPX?
8. Guardar el GPX para corregir data.ts
```
