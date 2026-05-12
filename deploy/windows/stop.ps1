#Requires -Version 5.1
<#
.SYNOPSIS
    Café del Rey — Detener todos los servicios en Windows
.DESCRIPTION
    Detiene los procesos PM2 (café-api y cafe-frontend).
    Opcionalmente elimina las instancias de PM2.
.EXAMPLE
    .\deploy\windows\stop.ps1            # detiene (puede reiniciarse)
    .\deploy\windows\stop.ps1 -Delete   # detiene y elimina de PM2
#>
param(
    [switch]$Delete
)

Set-StrictMode -Version Latest

function Write-Step { param($m) Write-Host "`n  ► $m" -ForegroundColor Cyan }
function Write-OK   { param($m) Write-Host "    ✓ $m" -ForegroundColor Green }
function Write-Warn { param($m) Write-Host "    ⚠ $m" -ForegroundColor Yellow }

Write-Host ""
Write-Host "  ► Deteniendo Café del Rey..." -ForegroundColor Yellow

# ── PM2 ───────────────────────────────────────────────────────────────────────
Write-Step "Deteniendo servicios PM2..."
try {
    if ($Delete) {
        pm2 delete cafe-api      2>$null
        pm2 delete cafe-frontend 2>$null
        pm2 save
        Write-OK "Instancias eliminadas de PM2"
    } else {
        pm2 stop cafe-api      2>$null
        pm2 stop cafe-frontend 2>$null
        Write-OK "Servicios detenidos (pm2 start pm2.config.cjs para reiniciar)"
    }
} catch {
    Write-Warn "PM2 no encontrado o sin procesos activos"
}

# ── Fallback: matar por puerto si PM2 no aplica ───────────────────────────────
Write-Step "Verificando puertos 8000 y 4001..."

function Stop-Port {
    param([int]$Port)
    $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        $pid = $conn.OwningProcess | Select-Object -First 1
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($proc) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-OK "Puerto $Port liberado (PID $pid — $($proc.ProcessName))"
        }
    } else {
        Write-OK "Puerto $Port ya estaba libre"
    }
}

Stop-Port 8000
Stop-Port 4001

Write-Host ""
Write-Host "  ✓ Todos los servicios detenidos." -ForegroundColor Green
Write-Host ""
