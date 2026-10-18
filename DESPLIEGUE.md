# Senderos — Cómo publicar

> La web en vivo: **https://modernizacionmunigm-tech.github.io/Senderos-GM/**

## La idea en una línea

`main` **no es código**: es el build ya compilado. `source` es el código.
Publicar = compilar y copiar el resultado a `main`.

| Rama | Qué tiene | Quién la toca |
|---|---|---|
| `source` | El código fuente (`app/`: React + TS) | vos / el agente |
| `main` | `index.html` + `assets/` (el build) | sólo lo que sale de `npm run build` |

**GitHub Pages sirve `main`.** Nada más. Por eso:

> ## 🔴 Nunca mergear `source` → `main`
> Un merge (o copiar el código fuente a mano) rompe el sitio.

## Forma normal: el script

```powershell
cd "C:\Users\Lenovo\Documents\Proyectos\Modernizacion Municipalidad\Proyecto Senderos Municipalidad"

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

Después, GitHub Pages tarda **un minuto** en mostrar los cambios. Refrescá con
`Ctrl + F5` (fuerza recarga, sino el navegador te muestra lo viejo).

## Si lo tenés que hacer a mano

Pasos exactos, equivalentes al script:

```powershell
$s = "C:\Users\Lenovo\Documents\Proyectos\Modernizacion Municipalidad\Proyecto Senderos Municipalidad"
$app = "$s\app"
$pub = "$s\_publicado"

# 1) compilar
cd $app
npm run build

# 2) copia de trabajo de main
#    core.autocrlf=false es importante: en Windows git convierte LF->CRLF al
#    bajar los archivos y eso ensucia las comparaciones.
git -c core.autocrlf=false -C $app fetch origin
git -c core.autocrlf=false -C $app worktree add -B main $pub origin/main

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
git -C $app worktree remove --force $pub
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
$s = "C:\Users\Lenovo\Documents\Proyectos\Modernizacion Municipalidad\Proyecto Senderos Municipalidad"
$app = "$s\app"; $pub = "$s\_publicado"

git -c core.autocrlf=false -C $app fetch origin
git -c core.autocrlf=false -C $app worktree add --detach $pub origin/main
git -c core.autocrlf=false -C $pub revert --no-edit HEAD
git -c core.autocrlf=false -C $pub push origin HEAD:main
git -C $app worktree remove --force $pub
```

Eso deshace **la última publicación**. Para deshacer dos, repetí el `revert`
(las veces que haga falta).

## Qué NO hacer

- ❌ **Nunca** mergear `source` → `main`.
- ❌ **Nunca** editar los archivos de `main` a mano (ni por la web de GitHub):
  el próximo `publicar.ps1` te los pisa y perdés el cambio.
- ❌ **Nunca** subir `app\src\` a `main`.
- ❌ No cambiar `base: '/Senderos-GM/'` en `vite.config.ts`: es a propósito,
  porque GitHub Pages sirve el sitio en un subdirectorio.

## Estado (al 18/10/2026)

| Cosa | Valor |
|---|---|
| Sitio en vivo | https://modernizacionmunigm-tech.github.io/Senderos-GM/ |
| Rama `main` (publicado) | `1f36192 Update README.md` |
| Rama `source` (código) | `c15fe09 Fuente del sitio Senderos Guardia Mitre (React + Vite + TS)` |
| ¿Hay algo sin publicar? | **No.** El build actual es byte por byte idéntico a lo publicado |
| Repo viejo `SenderosGuardiaMitre` | Ya no se publica (su URL da 404). Es archivo, está en `web-vieja\` |
