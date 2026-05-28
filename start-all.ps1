# ═══════════════════════════════════════════════════════════════════
#  start-all.ps1 — Start Unsaid Cebu backend + web at once
#
#  Usage:  .\start-all.ps1
#
#  Opens two PowerShell windows: one for backend (port 8080),
#  one for the React dev server (port 3000).
# ═══════════════════════════════════════════════════════════════════

$root = $PSScriptRoot

# ── Backend ──
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\unsaidcebu\unsaidcebu'; .\run.ps1"

# ── Web ──
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\web'; if (-not (Test-Path node_modules)) { npm install }; npm start"

Write-Host ""
Write-Host "  Starting Unsaid Cebu…"  -ForegroundColor Magenta
Write-Host "    Backend:  http://localhost:8080"
Write-Host "    Web:      http://localhost:3000"
Write-Host ""
Write-Host "  Wait ~15s for both to be ready, then open http://localhost:3000"
