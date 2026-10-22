# Senderos — Cómo publicar

> La web en vivo: **https://modernizacionmunigm-tech.github.io/Senderos-GM/**

## La idea en una línea

`main` **no es código**: es el build ya compilado. `source` es el proyecto
completo (código + docs + material). Publicar = compilar y copiar el resultado a
`main`.

| Rama | Qué tiene | Quién la toca |
|---|---|---|
| `source` | El proyecto completo: `app\` (el código), `AGENTS.md`, `DESPLIEGUE.md`, `publicar.ps1`, `datos\`, `marca\`, el PDF | vos / el agente |
| `main` | `index.html` + `assets/` (el build) | sólo lo que sale de `npm run build` |

**GitHub Pages sirve `main`.** Nada más. Por eso:

> ## 🔴 Nunca mergear `source` → `main`
> Un merge (o copiar el código fuente a mano) rompe el sitio.

## Forma normal: el script

Desde la carpeta del proyecto (no desde `app\`):

```powershell
cd "C:\Users\Lenovo\Documents\Proyectos\Modernizacion Municipalidad\Senderos"

.\publicar.ps1 -Simular     # compila y MUESTRA qué cambiaría. No sube nada.
.\publicar.ps1              # compila y publica
.\publicar.ps1 -Mensaje "Agregar sendero de bajada"
```

Si no cambió nada desde la última publicación, el script te avisa y **no hace
nada** (no genera commits vacíos):

```text
  El sitio ya esta al dia.
  El build es identico a lo publicado: no hay nada para subir.
```

Qué hace el script, en orden:

1. `npm run build` en `app\` → genera `app\dist\`
2. Prepara una copia de trabajo de la rama `main` en `_publicado\`
3. Copia `dist\index.html` y `dist\assets\` encima (no toca `README.md`)
4. Commit + `push origin main`
5. Borra `_publicado\`

El push a `main` dispara el workflow **"Publicar en GitHub Pages"**
(`.github\workflows\pages.yml`). Se ve correr en la pestaña **Actions** del repo
y tarda **uno o dos minutos**. Cuando termina, refrescá con `Ctrl + F5` (fuerza
recarga, sino el navegador te muestra lo viejo).

Si el workflow falla, el sitio **sigue mostrando la publicación anterior**: no
queda en blanco. El error se lee en la pestaña Actions.

## Si lo tenés que hacer a mano

Pasos exactos, equivalentes al script. Ojo: el repo es **la carpeta del
proyecto** (`$s`), no `app\`.

```powershell
$s   = "C:\Users\Lenovo\Documents\Proyectos\Modernizacion Municipalidad\Senderos"
$app = "$s\app"
$pub = "$s\_publicado"

# 1) compilar
cd $app
npm run build

# 2) copia de trabajo de main
#    core.autocrlf=false es importante: en Windows git convierte LF->CRLF al
#    bajar los archivos y eso ensucia las comparaciones.
git -c core.autocrlf=false -C $s fetch origin
git -c core.autocrlf=false -C $s worktree add -B main $pub origin/main

# 3) copiar el build encima
Copy-Item "$app\dist\index.html" "$pub\index.html" -Force
Remove-Item "$pub\assets" -Recurse -Force
Copy-Item "$app\dist\assets" "$pub\assets" -Recurse -Force

# 4) ver qué cambió (git status NO sirve, ver la nota de abajo)
git -c core.autocrlf=false -C $pub add -A
git -c core.autocrlf=false -C $pub diff --cached --name-status

# 5) publicar
git -c core.autocrlf=false -C $pub commit -m "Publicar build"
git -c core.autocrlf=false -C $pub push origin main

# 6) limpiar
git -C $s worktree remove --force $pub
```

> ### ⚠️ No uses `git status` para ver si cambió algo
> Este repo tiene `core.autocrlf=true`. Eso hace que git guarde los archivos con
> **LF** pero los baje al disco con **CRLF**. Resultado: `git status` marca
> `index.html` y los assets como *modificados* **siempre**, aunque sean
> idénticos. La forma correcta de comparar es `git add -A` y después
> `git diff --cached`: si no lista nada, no hay cambios reales.

## Volver atrás (rollback)

Si publicaste algo que rompió el sitio, se revierte con un commit al revés
(nunca borrando historia):

```powershell
$s   = "C:\Users\Lenovo\Documents\Proyectos\Modernizacion Municipalidad\Senderos"
$pub = "$s\_publicado"

git -c core.autocrlf=false -C $s fetch origin
git -c core.autocrlf=false -C $s worktree add --detach $pub origin/main
git -c core.autocrlf=false -C $pub revert --no-edit HEAD
git -c core.autocrlf=false -C $pub push origin HEAD:main
git -C $s worktree remove --force $pub
```

Eso deshace **la última publicación**. Para deshacer dos, repetí el `revert`
(las veces que haga falta).

## Qué NO hacer

- ❌ **Nunca** mergear `source` → `main`.
- ❌ **Nunca** editar los archivos de `main` a mano (ni por la web de GitHub):
  el próximo `publicar.ps1` te los pisa y perdés el cambio.
- ❌ **Nunca** subir `app\src\` a `main`.
- ❌ No borrar de `main` estos dos archivos: son los que hacen que Pages
  publique. `publicar.ps1` no los toca.
  - `.nojekyll` (evita que Pages procese el sitio con Jekyll)
  - `.github\workflows\pages.yml` (el workflow de publicación)
- ❌ No cambiar `base: '/Senderos-GM/'` en `vite.config.ts`: es a propósito,
  porque GitHub Pages sirve el sitio en un subdirectorio.

## Estado (al 19/10/2026)

| Cosa | Valor |
|---|---|
| Sitio en vivo | https://modernizacionmunigm-tech.github.io/Senderos-GM/ |
| Rama `main` (publicado) | `9708c67` — tres senderos reales, GPS, brújula y alto contraste (19/10/2026) |
| Rama `source` (proyecto) | el proyecto completo, con el código en `app\`. Para ver el último: `git log --oneline -1` |
| ¿Hay algo sin publicar? | **No** (al 19/10/2026) |
| Repo viejo `SenderosGuardiaMitre` | Ya no se publica (su URL da 404). Es archivo, está en `web-vieja\` |

### Por qué se publica con GitHub Actions (19/10/2026)

Hasta junio, Pages reconstruía el sitio solo con cada push a `main`
("Deploy from a branch"). El 19/10 esa publicación automática **dejó de
reconstruir**: el push llegaba bien, pero el sitio seguía sirviendo el build
viejo más de 20 minutos y no aparecía ningún build nuevo.

La salida fue pasar a **GitHub Actions**, que además deja log de cada
publicación:

| Archivo en `main` | Para qué |
|---|---|
| `.github\workflows\pages.yml` | Baja `main` y lo publica tal cual. No compila nada: el build ya lo hizo `publicar.ps1` |
| `.nojekyll` | Evita que Pages procese el sitio con Jekyll |

Para republicar a mano (sin tocar archivos): pestaña **Actions** →
"Publicar en GitHub Pages" → **Run workflow**.

### Cómo se llegó a esta estructura (18/10/2026)

Antes el repo tenía el código suelto en la raíz. Se reorganizó así:

| Commit | Qué hizo |
|---|---|
| `c15fe09` | El código original de la webapp |
| `128f91d` | El código pasó a `app\` (git lo tomó como *rename*: la historia se conservó) |
| `5172757` | Se sumaron los docs y el material del proyecto |

La rama `main` **no se tocó** en ninguna de esas reorganizaciones.
