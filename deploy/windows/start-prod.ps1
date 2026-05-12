#Requires -Version 5.1
<#
.SYNOPSIS
    Café del Rey — Modo PRODUCCIÓN en Windows (via PM2)
.DESCRIPTION
    Construye el frontend si no existe .next/, luego inicia
    ambos servicios como procesos persistentes con PM2.
    Los procesos sobreviven al cierre de la terminal.
.EXAMPLE
    .\deploy\windows\start-prod.ps1
    .\deploy\windows\start-prod.ps1 -Rebuild   # fuerza next build
#>
param(
    [switch]$Rebuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root    = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$ApiDir  = Join-Path $Root 'api'
$VenvPy  = Join-Path $ApiDir '.venv\Scripts\python.exe'
$LogsDir = Join-Path $Root 'logs'

function Write-Step { param($m) Write-Host "`n  ► $m" -ForegroundColor Cyan }
function Write-OK   { param($m) Write-Host "    ✓ $m" -ForegroundColor Green }
function Write-Warn { param($m) Write-Host "    ⚠ $m" -ForegroundColor Yellow }
function Write-Fail { param($m) Write-Host "`n  ✗ $m`n" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "  ╔══════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "  ║   Café del Rey — Producción (PM2)        ║" -ForegroundColor Magenta
Write-Host "  ╚══════════════════════════════════════════╝" -ForegroundColor Magenta

# ── Verificar setup previo ────────────────────────────────────────────────────
Write-Step "Verificando prerequisitos..."
if (-not (Test-Path $VenvPy))           { Write-Fail "Entorno virtual no encontrado. Ejecuta setup.ps1 primero." }
if (-not (Test-Path (Join-Path $Root 'node_modules'))) { Write-Fail "node_modules no encontrado. Ejecuta setup.ps1 primero." }
Write-OK "Prerequisitos OK"

# ── Verificar/instalar PM2 ────────────────────────────────────────────────────
Write-Step "Verificando PM2..."
try {
    $null = pm2 --version 2>&1
    Write-OK "PM2 disponible"
} catch {
    Write-Warn "PM2 no encontrado — instalando..."
    npm install -g pm2
    Write-OK "PM2 instalado"
}

# ── Crear directorio de logs ──────────────────────────────────────────────────
if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir -Force | Out-Null
    Write-OK "Directorio logs/ creado"
}

# ── Build del frontend ────────────────────────────────────────────────────────
$NextDir = Join-Path $Root '.next'
if ($Rebuild -or -not (Test-Path $NextDir)) {
    Write-Step "Construyendo frontend Next.js..."
    Push-Location $Root
    $env:NEXT_PUBLIC_API_URL  = 'http://localhost:8000'
    $env:API_INTERNAL_URL     = 'http://localhost:8000'
    $env:NODE_ENV             = 'production'
    npm run build
    if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Fail "next build falló" }
    Pop-Location
    Write-OK "Build completado"
} else {
    Write-OK "Build existente encontrado (usa -Rebuild para forzar)"
}

# ── Detener instancias previas si existen ─────────────────────────────────────
Write-Step "Limpiando instancias PM2 anteriores..."
$pm2List = pm2 list 2>&1
if ($pm2List -match 'cafe-api|cafe-frontend') {
    pm2 delete cafe-api      2>$null
    pm2 delete cafe-frontend 2>$null
    Write-OK "Instancias anteriores eliminadas"
} else {
    Write-OK "No había instancias previas"
}

# ── Iniciar servicios con PM2 ─────────────────────────────────────────────────
Write-Step "Iniciando servicios con PM2..."
Push-Location $Root
pm2 start pm2.config.cjs
if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Fail "pm2 start falló" }
pm2 save
Pop-Location
Write-OK "Servicios iniciados y guardados"

# ── Estado ────────────────────────────────────────────────────────────────────
Write-Step "Estado de los servicios:"
pm2 list

# ── Resumen ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║   Aplicación corriendo en producción             ║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "    Sitio público : http://localhost:4001" -ForegroundColor Cyan
Write-Host "    Panel admin   : http://localhost:4001/admin" -ForegroundColor Cyan
Write-Host "    API Swagger   : http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Comandos útiles:" -ForegroundColor White
Write-Host "    pm2 logs             # ver logs en tiempo real" -ForegroundColor Gray
Write-Host "    pm2 logs cafe-api    # solo el API" -ForegroundColor Gray
Write-Host "    pm2 restart all      # reiniciar todo" -ForegroundColor Gray
Write-Host "    pm2 monit            # dashboard interactivo" -ForegroundColor Gray
Write-Host "    .\deploy\windows\stop.ps1  # detener todo" -ForegroundColor Gray
Write-Host ""
Write-Host "  Para arranque automático con Windows:" -ForegroundColor White
Write-Host "    pm2 startup          # genera comando de registro" -ForegroundColor Gray
Write-Host "    pm2 save             # guarda lista actual" -ForegroundColor Gray
Write-Host ""
