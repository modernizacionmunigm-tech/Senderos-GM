# Senderos — Monte Mitre (Guardia Mitre)

> Webapp interactiva de los senderos del Monte Mitre, Municipalidad de Guardia
> Mitre. Vive dentro del paraguas `Modernizacion Municipalidad`.

## Qué es

App **mobile-first** para recorrer los senderos del Monte Mitre: mapa con GPS,
guía de flora y fauna, registro de tiempos y ranking. Se usa desde el celular,
en el monte, muchas veces sin señal.

| Carpeta | Qué es |
|---|---|
| `app/` | **El código vivo.** React + Vite + TypeScript |
| `datos/` | Trazados y planillas del proyecto (CSV, KMZ) |
| `marca/` | Logos del proyecto |
| `web-vieja/` | La web anterior, estática. **Ya no se publica**: es archivo |
| `_historico/` | Descarte (Google Studio, zips) |
| `Proyecto Senderos - Monte Mitre - Web app Interactiva.pdf` | El proyecto original |

## Dónde vive el código

**`app/` es la única fuente de verdad.** Stack: React 19 + Vite 6 + TypeScript +
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

## ⚠️ Los dos repos y las dos ramas (LO MÁS IMPORTANTE)

El repo es **`modernizacionmunigm-tech/Senderos-GM`** y tiene **dos ramas con
roles opuestos**:

| Rama | Qué tiene | Quién la toca |
|---|---|---|
| **`source`** | El **código fuente** (React + TS) | se trabaja acá |
| **`main`** | El **build publicado** (`index.html` + `assets/`) | sólo lo que sale de `npm run build` |

> ## 🔴 NUNCA mergear `source` → `main`
>
> **`main` no es código: es el resultado compilado.** Un merge (o un push del
> código fuente) rompe el sitio. `main` sólo recibe archivos **copiados desde
> `app/dist/`**.

`app/` está parado en la rama **`source`**. El sitio en vivo es
https://modernizacionmunigm-tech.github.io/Senderos-GM/

Hay otro repo viejo, `SenderosGuardiaMitre` (la web anterior, estática). Está en
`web-vieja/` como archivo y **ya no se publica** (su URL da 404).

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

`main` es una copia de `dist/`. Pasos y comandos exactos: **`DESPLIEGUE.md`**.

## Datos y claves

- `metadata.json` declara `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`, pero **el
  código no usa Gemini**: es herencia de Google AI Studio. No hay claves.
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
