<#
  SENDEROS - PUBLICAR
  ===========================================================================
  Compila la app y publica el resultado en la rama `main`, que es la que sirve
  GitHub Pages.

  Sitio en vivo: https://modernizacionmunigm-tech.github.io/Senderos-GM/

  Este repo es el del proyecto completo (rama `source`):
      app\                     la webapp (React + Vite + TS)
      AGENTS.md, DESPLIEGUE.md, publicar.ps1
      datos\, marca\, el PDF
  y la rama `main` es el build publicado.

  Ejemplos:
      .\publicar.ps1 -Simular     -> compila y MUESTRA que cambiaria, sin subir
      .\publicar.ps1              -> compila y publica
      .\publicar.ps1 -Mensaje "Agregar sendero de bajada"
      .\publicar.ps1              -> si no hay cambios, te avisa y no hace nada

  Como funciona:
      1. `npm run build` en app\  -> genera app\dist\
      2. Prepara una copia de trabajo de la rama `main` en _publicado\
      3. Copia dist\index.html y dist\assets\ encima (NO toca README.md)
      4. Commit y push a `main`
      5. Borra _publicado\

  ⚠️ NUNCA mergear `source` -> `main`. `main` no es codigo: es el build.

  El codigo fuente (lo que vos editás) vive en la rama `source`, que no se toca.
#>
param(
  [switch]$Simular,
  [string]$Mensaje,
  [switch]$SinBuild
)

$ErrorActionPreference = 'Stop'

$raiz = $PSScriptRoot                              # la carpeta del proyecto (= el repo)
$repo = $raiz
$app  = Join-Path $raiz 'app'                      # acá vive la webapp
$pub  = Join-Path $raiz '_publicado'               # copia de trabajo de `main`
$url  = 'https://modernizacionmunigm-tech.github.io/Senderos-GM/'

if (-not (Test-Path -LiteralPath (Join-Path $app 'package.json'))) {
  throw "No encuentro la app en: $app"
}

# Corre git sin que los warnings de stderr corten el script.
# core.autocrlf=false es a proposito: en Windows git convierte LF->CRLF al
# bajar los archivos, y eso ensucia las comparaciones. Con false, lo que hay
# en el disco es exactamente lo que hay guardado en git.
function Invoke-Git {
  param([string[]]$Argumentos)
  $ErrorActionPreference = 'Continue'
  $salida = & git -c core.autocrlf=false @Argumentos 2>&1
  $codigo = $LASTEXITCODE
  if ($codigo -ne 0) {
    throw ("git " + ($Argumentos -join ' ') + " fallo (codigo $codigo): " + ($salida -join ' '))
  }
  return $salida
}

# ---------------------------------------------------------------------------
# 1) Compilar
# ---------------------------------------------------------------------------
if ($SinBuild) {
  Write-Host '  (salteo el build: uso el dist\ que ya esta)' -ForegroundColor DarkGray
} else {
  Write-Host ''
  Write-Host '  Compilando (npm run build)...' -ForegroundColor Cyan
  $ErrorActionPreference = 'Continue'
  Push-Location $app
  try {
    & npm run build
    $codigo = $LASTEXITCODE
  } finally {
    Pop-Location
  }
  $ErrorActionPreference = 'Stop'
  if ($codigo -ne 0) { throw "Fallo el build (codigo $codigo). No se publico nada." }
}

$dist = Join-Path $app 'dist'
if (-not (Test-Path -LiteralPath (Join-Path $dist 'index.html'))) {
  throw "No hay build en: $dist"
}

# ---------------------------------------------------------------------------
# 2) Copia de trabajo de la rama main
# ---------------------------------------------------------------------------
Write-Host ''
Write-Host '  Preparando la rama main en _publicado\...' -ForegroundColor Cyan

Invoke-Git @('-C', $repo, 'fetch', 'origin') | Out-Null

if (Test-Path -LiteralPath $pub) { Invoke-Git @('-C', $repo, 'worktree', 'remove', '--force', $pub) | Out-Null }

Invoke-Git @('-C', $repo, 'worktree', 'add', '-B', 'main', $pub, 'origin/main') | Out-Null

# ---------------------------------------------------------------------------
# 3) Copiar el build encima de la copia
# ---------------------------------------------------------------------------
Copy-Item -LiteralPath (Join-Path $dist 'index.html') -Destination (Join-Path $pub 'index.html') -Force
$assetsPub = Join-Path $pub 'assets'
if (Test-Path -LiteralPath $assetsPub) { Remove-Item -LiteralPath $assetsPub -Recurse -Force }
Copy-Item -LiteralPath (Join-Path $dist 'assets') -Destination $assetsPub -Recurse -Force

# ---------------------------------------------------------------------------
# 4) Ver si REALMENTE cambio algo
#    Ojo: `git status` NO sirve acá, marca todo como modificado por los finales
#    de linea. La forma correcta: agregar al index y mirar `git diff --cached`.
# ---------------------------------------------------------------------------
Invoke-Git @('-C', $pub, 'add', '-A') | Out-Null
$staged = @(Invoke-Git @('-C', $pub, 'diff', '--cached', '--name-status'))

if ($staged.Count -eq 0) {
  Write-Host ''
  Write-Host '  El sitio ya esta al dia.' -ForegroundColor Green
  Write-Host '  El build es identico a lo publicado: no hay nada para subir.'
  Write-Host ''
  $limpio = $true
} else {
  $limpio = $false
  Write-Host ''
  Write-Host '  Esto es lo que cambiaria en la rama main:' -ForegroundColor Cyan
  $staged | ForEach-Object { Write-Host ("    " + $_) }
}

# ---------------------------------------------------------------------------
# 5) Publicar
# ---------------------------------------------------------------------------
if (-not $limpio -and -not $Simular) {
  if (-not $Mensaje) { $Mensaje = 'Publicar build ' + (Get-Date -Format 'yyyy-MM-dd HH:mm') }

  Write-Host ''
  Write-Host "  Publicando: $Mensaje" -ForegroundColor Cyan
  Invoke-Git @('-C', $pub, 'commit', '-m', $Mensaje) | Out-Null
  Invoke-Git @('-C', $pub, 'push', 'origin', 'main') | Out-Null

  Write-Host ''
  Write-Host '  Listo. GitHub Pages tarda un minuto en actualizar:' -ForegroundColor Green
  Write-Host "  $url"
}

# ---------------------------------------------------------------------------
# 6) Limpiar la copia de trabajo
# ---------------------------------------------------------------------------
if ($Simular -and -not $limpio) {
  Write-Host ''
  Write-Host '  -Simular: NO se subio nada.' -ForegroundColor Yellow
  Write-Host "  Dejo la copia de trabajo en: $pub"
  Write-Host '  Para ver el detalle:  git -C _publicado diff --cached'
  Write-Host '  Para borrarla:        git worktree remove --force _publicado'
} else {
  if (Test-Path -LiteralPath $pub) { Invoke-Git @('-C', $repo, 'worktree', 'remove', '--force', $pub) | Out-Null }
  Write-Host '  _publicado\ quedo limpio.'
}

exit 0
