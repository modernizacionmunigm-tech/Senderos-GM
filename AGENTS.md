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
| `carteleria\` | Mockups de la cartelería (`mockups.html`, a escala y con el trazado GPS real). El plan y los textos van aparte, en `CARTELERIA.md`; la lectura de la identidad municipal que pasaron desde la Muni, en `IDENTIDAD.md` |
| `AGENTS.md` (este), `DESPLIEGUE.md`, `publicar.ps1` | Documentación y script de publicación |
| `EVOLUCION.md` | Ideas a futuro (circuito grande, recorridos de la comunidad). **Nada implementado** |
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
- El ranking se alimenta de un **Web App de Apps Script** (`apps-script/Code.gs`)
  que lee la planilla **privada**. La app no conoce el CSV ni el formulario; ver
  "Ranking y seguridad" más abajo.
- **Flora y Fauna** tiene el catálogo de especies, las tarjetas de PlantNet e
  iNaturalist y el simulador de identificación de PlantNet (elige una especie
  del catálogo al azar y muestra un porcentaje: **es una simulación, no
  identifica de verdad**). El usuario decidió en oct 2026 dejarlo como estaba y
  **no** sumar enlaces a otras apps. El enlace de "Registrar avistamiento" usa
  coordenadas fijas: revisar antes de confiar en él.
- **Cronómetro que valida el recorrido y carga el tiempo solo** (oct 2026):
  al entrar al mapa pide el nombre **y la categoría deportiva** una vez (se
  guardan en el teléfono, `senderos_runner_name` y `senderos_runner_category`),
  así la tarjeta del final ya viene completa. Mientras se graba muestra
  **"Puntos validados: x de N"**: cada punto del sendero elegido se marca solo
  al pasar a menos de 30 m.
  El recorrido se da por **terminado** cuando pasó todos los puntos y, además,
  volvió a menos de 50 m del inicio (o llegó a la meta, en el Alta) con al
  menos el 80 % de la distancia hecha: ahí se frena el cronómetro solo y
  aparece la tarjeta para **cargar el tiempo al ranking**, sin pasar por el
  formulario (se manda por atrás al Web App de Apps Script). Si no hay
  señal, la marca queda en cola (`senderos_pending_marks`) y se sube sola al
  volver la conexión. Todo esto vive en **`app/src/corredor.ts`** (nombre,
  cola, envío) y en `MapModule.tsx`.
- La tarjeta de fin pide, además del nombre, la **categoría deportiva**, un
  **comentario** ("¿Cómo estuvo el recorrido?") y un **email opcional**
  (interno, no se publica). El sendero, el tiempo, la fecha y la hora salen solos.
- El **formulario manual** de "Registrar Tiempo" quedó como respaldo, escondido
  detrás de un enlace ("Cargar un tiempo que hice sin el celular"). Ahora pide
  lo mismo que la tarjeta de fin.
- **Tiempo en segundos (oct 2026).** La app manda `seconds` (entero) al Web App;
  la planilla guarda **"Tiempo (minutos)"** y **"Tiempo (segundos)"** separados
  (12 y 31). El formulario manual pide minutos y segundos y los convierte antes
  de enviar; `RankingTable` muestra `hh:mm:ss`.
- **La planilla tiene columnas propias para "Categoría", "Comentario aprobado"
  y "Email".** El Web App las escribe como campos separados. El ranking publica
  el **primer nombre completo y la inicial de cada palabra siguiente**
  (`Daniela Pérez` → `Daniela P.`; `Daniela Pérez Gómez` → `Daniela P. G.`),
  también para menores con autorización del adulto responsable, y sólo los
  **comentarios aprobados**. Modernización revisa la planilla y tilda la casilla
  de la columna **Comentario aprobado**. El email queda sólo para uso interno
  (verificar una baja) y nunca se devuelve.
- **El ranking público es del mes calendario actual**, según la fecha del
  recorrido. La planilla conserva todos los meses. La tabla histórica de
  primeros puestos y el resumen anual quedan para más adelante.
- La tabla **prefiere la marca guardada en el teléfono** cuando la misma
  (nombre + sendero + día) ya aparece en la planilla: así no se duplica y no se
  pierde la categoría elegida. Si el comentario fue aprobado, lo toma de la
  planilla. El nombre guardado en el teléfono se abrevia con la misma regla
  antes de mostrarlo y de compararlo con la planilla.

Pendientes:

- **No hay service worker.** El sitio no queda cacheado para arrancar offline.
  **Decidido (oct 2026): no se agrega por ahora**, se evalúa más adelante si hace
  falta. Ya se sacó la promesa de uso sin señal del banner de instalación
  (`PWAInstallBanner.tsx`); la cartelería tampoco la promete (ver
  `PEDIDO-WEB-QR.md`).
- Perfiles de elevación: hoy sólo está el desnivel total, sin gráfico.
- Compartir el resultado de una marca (y el puesto en la tabla).
- **Tabla histórica / anual:** a fin de año, armar un resumen de primeros
  puestos y una tabla general del año. La planilla ya conserva todo el historial;
  el ranking público hoy muestra sólo el mes actual.
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
cd "C:\Users\Lenovo\Documents\Proyectos\Modernizacion Municipalidad\Senderos\app"

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

El push a `main` lo publica un workflow de **GitHub Actions**
(`.github\workflows\pages.yml`, que vive en `main` junto con `.nojekyll`).
Tarda uno o dos minutos y se ve en la pestaña **Actions**. La publicación
automática "desde la rama" dejó de funcionar el 19/10/2026; por eso está el
workflow. No borrar esos dos archivos de `main`: `publicar.ps1` no los toca.

## Datos y claves

- `app/metadata.json` declara `MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API`, pero
  **el código no usa Gemini**: es herencia de Google AI Studio. No hay claves.
- `.env` está ignorado por git. En el repo sólo está `.env.example`, con valores
  de mentira. **Nunca** commitear un `.env` real.

## Ranking y seguridad (oct 2026)

- La app ya **no lee el CSV publicado** ni manda al Formulario de Google. Habla
  con el Web App de `apps-script/Code.gs`. La planilla y el formulario quedan
  **privados**; el único intermediario es el script.
- URL del Web App: `app/src/api.ts` (`API_URL_FALLBACK`) o `VITE_SENDEROS_API` al
  compilar. La URL es pública por diseño; la hoja no. Pasos completos en
  `apps-script/README.md`.
- `GET ?action=rankings` devuelve el ranking **del mes actual**: primer nombre
  completo y la inicial de cada palabra siguiente, sendero, tiempo, categoría,
  fecha y comentarios **sólo si están aprobados**. **Nunca** devuelve emails,
  teléfonos ni comentarios sin aprobar.
- `POST action=submit` valida, deduplica y limita por dispositivo/nombre/hora.
  El captcha de suma usa un nonce de un solo uso; el captcha del frontend es un
  filtro, no la defensa principal.
- La CSP se inyecta **sólo en el build** desde `vite.config.ts`. GitHub Pages no
  permite headers personalizados, así que no hay `frame-ancestors`;
  `main.tsx` hace un frame-busting básico.
- El consentimiento arranca **destildado** y el aviso de privacidad está en
  `PrivacyNotice.tsx`.
- `npm audit --omit=dev` da **0**. Los avisos que quedan son de dependencias de
  build (Vite/PostCSS), no del sitio publicado.
- Pruebas: `apps-script` tiene `selftest()` para ejecutar en el editor. Los E2E
  viven fuera del repo (temp) para no sumar Playwright al proyecto.
- Contacto oficial de privacidad y seguridad: **modernizacion.munigm@gmail.com**
  (en `PrivacyNotice.tsx` y `SECURITY.md`).
- Hecho (22/10/2026): `Untitled-1.js` y `Untitled-3.js` se movieron a
  `_historico/club-guardia-mitre/` y se limpiaron del historial de `source`.
  Quedan fuera del repo; la copia local está ignorada por git.
- Manual, una sola vez: despublicar la hoja y cerrar el formulario. Si el CSV
  sigue publicado, la URL vieja sigue exponiendo datos aunque la app ya no la
  use.

## Basura conocida (no borrar sin preguntar)

- `app/src/Untitled-1.js` y `app/src/Untitled-3.js`: **no son de Senderos.** Son
  código de Apps Script de **otro sistema** ("Club Guardia Mitre"). Se
  versionaron por error. Se sacaron del árbol y del historial de `source` el
  22/10/2026; la copia local quedó en `_historico/club-guardia-mitre/`
  (ignorada por git).
- `app/assets/img/`: copia vieja de las imágenes. Las que usa el build son las de
  `app/src/assets/images/`.

## Convenciones

- Todo el texto en **español rioplatense**.
- **No borrar ni mover nada sin preguntar.**
- Lo viejo no se borra: se mueve a `_historico/`.
- Mensajes de commit en español.
