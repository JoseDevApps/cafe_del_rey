#Requires -Version 5.1
<#
.SYNOPSIS
    Café del Rey — Setup completo para Windows (sin Docker)
.DESCRIPTION
    Verifica prerequisitos, crea entorno virtual Python, instala dependencias
    de Node.js y construye el frontend en modo producción.
.EXAMPLE
    .\deploy\windows\setup.ps1
    .\deploy\windows\setup.ps1 -SkipBuild   # solo instala, no hace 'next build'
#>
param(
    [switch]$SkipBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Colores ────────────────────────────────────────────────────────────────────
function Write-Step  { param($msg) Write-Host "`n  ► $msg" -ForegroundColor Cyan }
function Write-OK    { param($msg) Write-Host "    ✓ $msg" -ForegroundColor Green }
function Write-Warn  { param($msg) Write-Host "    ⚠ $msg" -ForegroundColor Yellow }
function Write-Fail  { param($msg) Write-Host "`n  ✗ $msg`n" -ForegroundColor Red; exit 1 }

# ── Rutas ─────────────────────────────────────────────────────────────────────
$Root    = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$ApiDir  = Join-Path $Root 'api'
$VenvDir = Join-Path $ApiDir '.venv'

Write-Host ""
Write-Host "  ╔═══════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "  ║   Café del Rey — Setup Windows        ║" -ForegroundColor Magenta
Write-Host "  ╚═══════════════════════════════════════╝" -ForegroundColor Magenta

# ── 1. Verificar Node.js ──────────────────────────────────────────────────────
Write-Step "Verificando Node.js..."
try {
    $nodeVer = node --version 2>&1
    $nodeMajor = [int]($nodeVer -replace 'v(\d+)\..*','$1')
    if ($nodeMajor -lt 18) { Write-Fail "Node.js >= 18 requerido. Instala desde https://nodejs.org" }
    Write-OK "Node.js $nodeVer"
} catch {
    Write-Fail "Node.js no encontrado. Descarga desde https://nodejs.org"
}

# ── 2. Verificar Python ───────────────────────────────────────────────────────
Write-Step "Verificando Python..."
$PythonExe = $null
foreach ($cmd in @('python', 'python3', 'py')) {
    try {
        $ver = & $cmd --version 2>&1
        if ($ver -match 'Python 3\.(1[0-9]|[2-9]\d)') {
            $PythonExe = (Get-Command $cmd).Source
            Write-OK "$ver  ($PythonExe)"
            break
        }
    } catch {}
}
if (-not $PythonExe) {
    Write-Fail "Python >= 3.10 no encontrado. Descarga desde https://python.org"
}

# ── 3. Entorno virtual Python ─────────────────────────────────────────────────
Write-Step "Configurando entorno virtual Python en api/.venv ..."
if (Test-Path $VenvDir) {
    Write-OK "Entorno virtual ya existe — saltando creación"
} else {
    & $PythonExe -m venv $VenvDir
    Write-OK "Entorno virtual creado"
}

$VenvPython = Join-Path $VenvDir 'Scripts\python.exe'
$VenvPip    = Join-Path $VenvDir 'Scripts\pip.exe'

# ── 4. Instalar dependencias Python ──────────────────────────────────────────
Write-Step "Instalando dependencias Python (api/requirements.txt)..."
& $VenvPip install --quiet --upgrade pip
& $VenvPip install --quiet -r (Join-Path $ApiDir 'requirements.txt')
Write-OK "Dependencias Python instaladas"

# ── 5. Crear api/.env si no existe ───────────────────────────────────────────
Write-Step "Configurando variables de entorno del API..."
$EnvFile    = Join-Path $ApiDir '.env'
$EnvExample = Join-Path $ApiDir '.env.example'
if (-not (Test-Path $EnvFile)) {
    if (Test-Path $EnvExample) {
        Copy-Item $EnvExample $EnvFile
        Write-Warn ".env creado desde .env.example — revisa y cambia las credenciales antes de producción"
    } else {
        @"
ADMIN_USERNAME=superadmin
ADMIN_PASSWORD=cafedelrey2025
JWT_SECRET=secreto_jwt_cambiar_en_produccion_ahora
JWT_EXPIRE_HOURS=8
UPLOADS_DIR=./uploads
DB_PATH=./data/cafe.db
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4001
"@ | Set-Content $EnvFile -Encoding UTF8
        Write-OK ".env creado con valores por defecto"
    }
} else {
    Write-OK ".env ya existe — no se sobreescribe"
}

# ── 6. Crear directorios de datos ─────────────────────────────────────────────
Write-Step "Creando directorios de datos..."
$dirs = @(
    (Join-Path $ApiDir 'uploads'),
    (Join-Path $ApiDir 'data')
)
foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Path $d -Force | Out-Null
        Write-OK "Creado: $d"
    } else {
        Write-OK "Ya existe: $d"
    }
}

# ── 7. Instalar dependencias Node.js ─────────────────────────────────────────
Write-Step "Instalando dependencias Node.js (npm install)..."
Push-Location $Root
npm install --loglevel=error
if ($LASTEXITCODE -ne 0) { Write-Fail "npm install falló" }
Write-OK "node_modules instalado"

# ── 8. Build del frontend ─────────────────────────────────────────────────────
if (-not $SkipBuild) {
    Write-Step "Construyendo frontend Next.js (npm run build)..."
    $env:NEXT_PUBLIC_API_URL = 'http://localhost:8000'
    $env:API_INTERNAL_URL    = 'http://localhost:8000'
    npm run build
    if ($LASTEXITCODE -ne 0) { Write-Fail "next build falló" }
    Write-OK "Build completado (.next/)"
} else {
    Write-Warn "Build omitido (-SkipBuild). Corre 'npm run build' antes de iniciar producción."
}
Pop-Location

# ── 9. Verificar PM2 ─────────────────────────────────────────────────────────
Write-Step "Verificando PM2 (process manager)..."
try {
    $pm2Ver = pm2 --version 2>&1
    Write-OK "PM2 $pm2Ver"
} catch {
    Write-Warn "PM2 no encontrado — instalando globalmente..."
    npm install -g pm2
    Write-OK "PM2 instalado"
}

# ── Resumen ────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║   Setup completado con éxito               ║" -ForegroundColor Green
Write-Host "  ╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  Próximos pasos:" -ForegroundColor White
Write-Host ""
Write-Host "    Desarrollo:   .\deploy\windows\start-dev.ps1" -ForegroundColor Cyan
Write-Host "    Producción:   .\deploy\windows\start-prod.ps1" -ForegroundColor Cyan
Write-Host "    Detener:      .\deploy\windows\stop.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "    Sitio:   http://localhost:4001" -ForegroundColor Yellow
Write-Host "    API:     http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "    Admin:   http://localhost:4001/admin" -ForegroundColor Yellow
Write-Host ""
