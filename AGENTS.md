# Senderos — Monte Mitre (Guardia Mitre)

> Webapp interactiva de los senderos del Monte Mitre, Municipalidad de Guardia
> Mitre. Vive dentro del paraguas `Modernizacion Municipalidad`.

## Qué es

App **mobile-first** para recorrer los senderos del Monte Mitre: mapa con GPS,
guía de flora y fauna, registro de tiempos y ranking. Se usa desde el celular,
en el monte, muchas veces sin señal.

## Esta carpeta ES el repo

La carpeta del proyecto es el repo **`modernizacionmunigm-tech/Senderos-GM`**
(rama `source`). Adentro está todo:

| Carpeta / archivo | Qué es |
|---|---|
| `app\` | **El código vivo.** React + Vite + TypeScript |
| `datos\` | Trazados y planillas del proyecto (CSV, KMZ) |
| `marca\` | Logos del proyecto |
| `carteleria\` | Mockups de la cartelería (`mockups.html`, a escala y con el trazado GPS real). El plan y los textos van aparte, en `CARTELERIA.md` |
| `AGENTS.md` (este), `DESPLIEGUE.md`, `publicar.ps1` | Documentación y script de publicación |
| `Proyecto Senderos - Monte Mitre - Web app Interactiva.pdf` | El proyecto original |
| `web-vieja\` | La web anterior, estática. **Ya no se publica**: es archivo. Tiene su propio repo (`SenderosGuardiaMitre`), por eso está ignorada por git |
| `_historico\` | Descarte (Google Studio, zips). Ignorada por git |

## Dónde vive el código

**`app\` es la única fuente de verdad.** Stack: React 19 + Vite 6 + TypeScript +
Tailwind 4 + Leaflet (mapas) + `motion` (animaciones).

Los componentes están en `app/src/components/`:

| Componente | Qué hace |
|---|---|
| `MapModule.tsx` | Mapa, GPS, checkpoints |
| `FloraGuide.tsx` | Guía de flora y fauna |
| `TimeForm.tsx` / `RankingTable.tsx` | Registro de tiempos y tabla de posiciones |
| `TrailCard.tsx` / `TrailMiniMap.tsx` | Ficha y mini-mapa de cada sendero |
| `Header.tsx` / `Logos.tsx` / `AboutProject.tsx` | Estructura y páginas |
| `PWAInstallBanner.tsx` / `WeatherWidget.tsx` | Extras (instalación, clima) |

Los datos están en `app/src/data.ts` (senderos) y `app/src/floraData.ts` (flora).

## Estado actual (oct 2026)

- Los **tres senderos** (baja, media, alta) salen de los KMZ relevados con GPS
  (`datos/Sendero Baja real.kmz`, `datos/Sendero Alta real.kmz`). Las distancias
  se calculan sobre el trazado; los desniveles se estiman con modelos digitales
  de elevación (Copernicus GLO-90 y SRTM 30 m). Ver el comentario en `data.ts`.
- El mapa tiene **GPS en vivo**, grabación del recorrido, aviso de desvío
  (>40 m), cronómetro, modo simple y una **brújula** que muestra distancia y
  rumbo al punto más cercano del sendero elegido.
- **Modo alto contraste** ("modo sol"): botón en el encabezado; se guarda en el
  navegador. Los bloques con fondo oscuro llevan la clase `hc-dark` (`hc-` =
  high contrast) para que no se les oscurezca el texto. Ver `index.css`.
- **Bundle separado**: `MapModule`, `FloraGuide` y `TrailMiniMap` (que trae
  Leaflet) se cargan con `React.lazy`. El arranque pasó de ~447 kB a ~295 kB.
- El mapa y los mini-mapas usan **tiles de OpenStreetMap** (no piden clave).
  CARTO quedó descartado: ahora exige API key y deja marca de agua.
- Deep links para los QR de cartelería: `?tab=` y `?sendero=baja|media|alta`
  (o el id completo) ya funcionan. Falta `?poi=` para abrir un punto puntual.
- El ranking se alimenta de una **planilla publicada de Google Sheets**
  (`DEFAULT_GOOGLE_SHEET_CSV_URL` en `data.ts` y en `floraData.ts`).

Pendientes:

- **No hay service worker.** El sitio no queda cacheado para arrancar offline.
  **Decidido (oct 2026): no se agrega por ahora**, se evalúa más adelante si hace
  falta. Ya se sacó la promesa de uso sin señal del banner de instalación
  (`PWAInstallBanner.tsx`); la cartelería tampoco la promete (ver
  `PEDIDO-WEB-QR.md`).
- Perfiles de elevación: hoy sólo está el desnivel total, sin gráfico.
- Compartir el resultado de una marca (y el puesto en la tabla).
- Cartelería de los senderos: plan y textos en **`CARTELERIA.md`**; el pedido de
  deep links para los QR, en **`PEDIDO-WEB-QR.md`**.

## ⚠️ Las dos ramas (LO MÁS IMPORTANTE)

El repo tiene **dos ramas con roles opuestos**:

| Rama | Qué tiene | Quién la toca |
|---|---|---|
| **`source`** | El **proyecto completo**: el código (`app\`), los docs y el material | se trabaja acá |
| **`main`** | El **build publicado** (`index.html` + `assets/`) | sólo lo que sale de `npm run build` |

> ## 🔴 NUNCA mergear `source` → `main`
>
> **`main` no es código: es el resultado compilado.** Un merge (o un push del
> código fuente) rompe el sitio. `main` sólo recibe archivos **copiados desde
> `app\dist\`**.

El sitio en vivo: https://modernizacionmunigm-tech.github.io/Senderos-GM/

## Comandos

```powershell
cd "C:\Users\Lenovo\Documents\Proyectos\Modernizacion Municipalidad\Proyecto Senderos Municipalidad\app"

npm install      # una sola vez
npm run dev      # servidor local -> http://localhost:3000
npm run lint     # chequeo de tipos (tsc --noEmit)
npm run build    # genera dist\  (es lo que se publica)
```

En `vite.config.ts`, `base: '/Senderos-GM/'` **es a propósito**: GitHub Pages
sirve el sitio en un subdirectorio, no en la raíz. No cambiarlo.

## Cómo publicar

Desde la carpeta del proyecto (no desde `app\`):

```powershell
.\publicar.ps1 -Simular     # compila y muestra qué cambiaría. No sube nada.
.\publicar.ps1              # compila y publica
```

`main` es una copia de `app\dist\`. Pasos y comandos exactos: **`DESPLIEGUE.md`**.

## Datos y claves

- `app/metadata.json` declara `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`, pero
  **el código no usa Gemini**: es herencia de Google AI Studio. No hay claves.
- `.env` está ignorado por git. En el repo sólo está `.env.example`, con valores
  de mentira. **Nunca** commitear un `.env` real.

## Basura conocida (no borrar sin preguntar)

- `app/src/Untitled-1.js` y `app/src/Untitled-3.js`: **no son de Senderos.** Son
  código de Apps Script de **otro sistema** ("Club Guardia Mitre"). Se
  versionaron por error. Se pueden sacar, pero preguntar antes.
- `app/assets/img/`: copia vieja de las imágenes. Las que usa el build son las de
  `app/src/assets/images/`.

## Convenciones

- Todo el texto en **español rioplatense**.
- **No borrar ni mover nada sin preguntar.**
- Lo viejo no se borra: se mueve a `_historico/`.
- Mensajes de commit en español.
