# Pedido — Deep links de QR para la cartelería

> Este archivo es para pedir en la sesión donde se trabaja la web.
> Contexto y plan completo: **`CARTELERIA.md`**.
> **Nada de esto se puede cambiar después de imprimir los QR.** Por eso la spec
> se congela antes de mandar a la imprenta.

---

## 1. Qué se necesita y por qué

La cartelería de los senderos lleva **QR impresos**. Una vez impresos, la URL
queda congelada: si después cambia, todos esos carteles apuntan a la nada.

Hoy ya funciona el deep link por sendero (las placas de inicio ya tienen su URL).
Falta el deep link por punto, que **queda para más adelante** (ver sección 3) y no
bloquea la imprenta. Lo que sí conviene arreglar ahora es el texto del banner de
instalación (sección 4).

---

## 2. Lo que YA funciona (no tocar)

En `app/src/App.tsx` (useEffect de la línea ~50):

| Parámetro | Valores | Efecto |
|---|---|---|
| `?tab=` | `inicio`, `senderos`, `mapa`, `tiempos`, `ranking`, `biodiversidad`, `proyecto` | Abre esa sección |
| `?sendero=` | `baja`, `media`, `alta` (o el id completo `monte-mitre-alta`) | Abre el **mapa** con ese sendero elegido y dibujado |

Ejemplo que ya anda: `https://modernizacionmunigm-tech.github.io/Senderos-GM/?tab=mapa&sendero=alta`

Dato a tener en cuenta: el efecto que sincroniza la URL con el tab (línea ~77)
**conserva los parámetros extra**, así que `?sendero=` sobrevive a la navegación.
No hay que tocarlo.

---

## 3. Lo que falta: `?poi=` (prioridad baja por ahora)

> **Prioridad: baja.** Con el service worker descartado por ahora, la app no
> funciona sin señal, así que las placas de los puntos numerados **no van a llevar
> QR** (ver `CARTELERIA.md`, sección 3.4). Este pedido queda listo para cuando se
> agregue el service worker. **No bloquea la imprenta.**

**Objetivo:** el QR de una placa de punto numerado abre el mapa, con el sendero
elegido, **centrado en ese punto y con su globito abierto**.

Formato: `.../Senderos-GM/?tab=mapa&sendero=alta&poi=3`

### Definición precisa

- `poi` es **el número que está pintado en el cartel**, con el mismo criterio de
  numeración que ya usa el mapa: **no cuenta el inicio (▶) ni la meta (■)**.
  El punto 1 es el primero después del inicio. Ese criterio ya existe en
  `MapModule.tsx` (~líneas 272-277) y no hay que inventar otro.
- Rangos válidos por sendero: **baja 1..8 · media 1..7 · alta 1..7**.
- Si `poi` está fuera de rango, si el sendero no existe, o si viene `poi` sin
  `sendero`: **ignorar en silencio** y comportarse como hoy (mapa general o mapa
  del sendero). Nunca mostrar error ni romper el arranque.
- No debe depender del GPS ni de permisos del navegador.

### Sugerencia de implementación (a criterio de quien lo haga)

1. En `App.tsx`, extender el useEffect de deep link (~línea 50) para leer también
   `poi` con `parseInt`, validarlo contra el rango del sendero encontrado y
   guardarlo en un estado nuevo (`initialPoiNumber: number | null`).
2. Pasarlo a `MapModule` como prop nueva. `MapModule` ya recibe props
   (`MapModuleProps` está en `MapModule.tsx` línea 95; el uso está en `App.tsx`
   línea 353): agregar `initialPoiNumber?: number | null`.
3. En `MapModule`, dentro del efecto que dibuja los marcadores (~línea 324), si
   viene `initialPoiNumber`: ubicar ese punto con la misma numeración, hacer
   `map.setView([poi.lat, poi.lng], 17)` y abrir el popup del marcador.
4. No cambiar el arranque por defecto del mapa cuando no hay `poi`.

### Criterios de aceptación

Probar en local (`npm run dev`) escribiendo las URLs a mano:

| URL | Resultado esperado |
|---|---|
| `/?tab=mapa&sendero=baja&poi=3` | Mapa abierto, Baja elegida, centrado en "Segundo cañadón", popup abierto |
| `/?sendero=alta&poi=7` | Mapa abierto, Alta elegida, centrado en "El empuje final" |
| `/?tab=mapa&sendero=alta&poi=99` | Mapa del Alta normal, sin error |
| `/?tab=mapa&sendero=alta&poi=abc` | Mapa del Alta normal, sin error |
| `/?tab=mapa&poi=3` | Mapa general, sin error (el `poi` solo no alcanza) |
| `/?tab=biodiversidad` | Sigue funcionando igual |
| `/` (sin parámetros) | Sigue arrancando en Inicio, igual que hoy |

---

## 4. El tema del offline (decidido)

**Decisión: no se agrega service worker por ahora.** Se evalúa más adelante si
hace falta. Entonces, hoy el sitio **no arranca sin señal**, y eso hay que
respetarlo en todos los textos:

- **Cartelería:** en ningún cartel va la palabra "sin señal". El QR se plantea
  como "mirá la app antes de salir" y "registrá tu tiempo cuando vuelvas", no
  como "esto te guía en el monte".
- **Banner de instalación de la app** (`app/src/components/PWAInstallBanner.tsx`):
  decía *"Guarda mapas de senderos de Guardia Mitre offline, navega con GPS
  sin señal y registra tus tiempos"* y tenía una etiqueta **"offline"**.
  ✅ **Corregido (oct 2026):** ahora dice *"Accedé más rápido desde la pantalla de
  inicio"*, se sacó la etiqueta "offline" y se agregó el aviso *"Mirá el mapa
  antes de salir: una vez en el monte puede no haber señal."*

### Nota: cuando se agregue el service worker

Es el trabajo que convierte a la app en algo usable caminando (y el que hace que
los QR del monte valgan). Cuando se decida, el pedido es: cachear el sitio con
`vite-plugin-pwa` (o equivalente) para que abra sin red, y volver a poner el
texto de offline. **No cambia ninguna URL**, así que se puede hacer después de
imprimir la cartelería sin romper nada.

---

## 5. URLs definitivas para la imprenta (congelar)

Usar las formas **cortas** (`sendero=alta`, no el id completo): el QR queda con
menos módulos, se escanea mejor al sol y aguanta mejor el desgaste.

| Pieza | URL impresa |
|---|---|
| Cartel de Senderos (la puerta) | `.../Senderos-GM/?tab=senderos` |
| Placa inicio — Baja | `.../Senderos-GM/?tab=mapa&sendero=baja` |
| Placa inicio — Media | `.../Senderos-GM/?tab=mapa&sendero=media` |
| Placa inicio — Alta | `.../Senderos-GM/?tab=mapa&sendero=alta` |
| Cara "¡LLEGASTE!" (misma placa, doble cara) | `.../Senderos-GM/?tab=tiempos` |
| Punto numerado N | `.../Senderos-GM/?tab=mapa&sendero=<s>&poi=<N>` — **no se imprime por ahora** (ver 3) |
| Guía de flora y fauna | `.../Senderos-GM/?tab=biodiversidad` |
| Reglamento / avisos | `.../Senderos-GM/?tab=proyecto` |

Base: `https://modernizacionmunigm-tech.github.io/Senderos-GM/`

### Regla de oro

**La URL no se cambia nunca.** Si algún día el sitio se muda del dominio de
GitHub Pages a uno municipal, los 40 QR quedan muertos. Si hay riesgo de mudanza,
conviene que los QR apunten a una **URL corta propia** que redirija (a definir
con el municipio).

---

## 6. Resumen para pedirlo

Lo que hay que hacer **ahora**, que es poco:

> 1. ✅ **Hecho (oct 2026).** El banner de instalación (`PWAInstallBanner.tsx`) ya
>    no promete uso sin señal ni tiene la etiqueta "offline". El service worker
>    queda descartado por ahora.
> 2. Cuando se pueda, el `?poi=` para el QR de los puntos: que abra el mapa en ese
>    punto (el número pintado en el cartel, el mismo que muestra el mapa). Si el
>    punto no existe, que abra el mapa normal sin romper nada. Está especificado
>    en `PEDIDO-WEB-QR.md`, con criterios de aceptación. **No urge**: depende del
>    service worker.
