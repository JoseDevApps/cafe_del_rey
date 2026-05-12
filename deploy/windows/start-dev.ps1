#Requires -Version 5.1
<#
.SYNOPSIS
    Café del Rey — Modo DESARROLLO en Windows
.DESCRIPTION
    Inicia el API (FastAPI con --reload) y el frontend (Next.js dev)
    en dos ventanas de terminal separadas.
    Los cambios en el código se reflejan automáticamente.
.EXAMPLE
    .\deploy\windows\start-dev.ps1
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Root    = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$ApiDir  = Join-Path $Root 'api'
$VenvPy  = Join-Path $ApiDir '.venv\Scripts\python.exe'

# ── Verificar setup ───────────────────────────────────────────────────────────
if (-not (Test-Path $VenvPy)) {
    Write-Host "  [ERROR] Entorno virtual no encontrado." -ForegroundColor Red
    Write-Host "  Ejecuta primero: .\deploy\windows\setup.ps1" -ForegroundColor Yellow
    exit 1
}
if (-not (Test-Path (Join-Path $Root 'node_modules'))) {
    Write-Host "  [ERROR] node_modules no encontrado." -ForegroundColor Red
    Write-Host "  Ejecuta primero: .\deploy\windows\setup.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "  ► Iniciando Café del Rey en modo DESARROLLO..." -ForegroundColor Cyan
Write-Host ""

# ── Variables de entorno del frontend ─────────────────────────────────────────
$frontendEnv = @"
`$env:NODE_ENV                 = 'development'
`$env:NEXT_PUBLIC_API_URL      = 'http://localhost:8000'
`$env:API_INTERNAL_URL         = 'http://localhost:8000'
`$env:NEXT_PUBLIC_SITE_URL     = 'http://localhost:4001'
Set-Location '$Root'
Write-Host '  Frontend listo. Visita: http://localhost:4001' -ForegroundColor Green
npm run dev -- -p 4001
"@

# ── Variables de entorno del API ──────────────────────────────────────────────
$apiEnv = @"
Set-Location '$ApiDir'
& '$VenvPy' -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
"@

# ── Abrir ventana del API ─────────────────────────────────────────────────────
Write-Host "  ► Abriendo terminal del API  (puerto 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "& { Write-Host '  ╔═══════════════════════╗' -ForegroundColor Magenta; Write-Host '  ║  Café del Rey — API   ║' -ForegroundColor Magenta; Write-Host '  ╚═══════════════════════╝' -ForegroundColor Magenta; $apiEnv }"
)

# ── Pequeña pausa para que el API inicie primero ──────────────────────────────
Start-Sleep -Seconds 2

# ── Abrir ventana del frontend ────────────────────────────────────────────────
Write-Host "  ► Abriendo terminal del Frontend (puerto 4001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "& { Write-Host '  ╔═══════════════════════════════╗' -ForegroundColor Cyan; Write-Host '  ║  Café del Rey — Frontend      ║' -ForegroundColor Cyan; Write-Host '  ╚═══════════════════════════════╝' -ForegroundColor Cyan; $frontendEnv }"
)

Write-Host ""
Write-Host "  ✓ Servicios iniciados en ventanas separadas" -ForegroundColor Green
Write-Host ""
Write-Host "    Sitio público : http://localhost:4001" -ForegroundColor Cyan
Write-Host "    Panel admin   : http://localhost:4001/admin" -ForegroundColor Cyan
Write-Host "    API Swagger   : http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Credenciales:  superadmin / cafedelrey2025" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Para detener: cierra las ventanas o ejecuta .\deploy\windows\stop.ps1" -ForegroundColor Gray
