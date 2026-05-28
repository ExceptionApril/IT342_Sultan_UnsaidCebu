# ═══════════════════════════════════════════════════════════════════
#  run.ps1 — Unsaid Cebu backend launcher (JDK 17 / NIO2 Tomcat)
#
#  Usage:
#     cd unsaidcebu\unsaidcebu
#     .\run.ps1
#
#  What it does:
#   1. Locates JDK 17 (JBR or system)
#   2. Sets java.io.tmpdir to C:\Temp (avoids Windows username-spaces bug
#      in JDK 17+ Unix Domain Sockets / PipeImpl)
#   3. Builds the Spring Boot fat-jar if missing or out of date
#   4. Launches it and polls health endpoint until ready
# ═══════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

# ── 0. Load .env (DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET) ───
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $kv = $line -split "=", 2
            if ($kv.Length -eq 2) {
                $k = $kv[0].Trim()
                $v = $kv[1].Trim().Trim('"').Trim("'")
                Set-Item -Path "Env:$k" -Value $v
            }
        }
    }
} else {
    Write-Host "  [!] .env not found at $envFile" -ForegroundColor Yellow
    Write-Host "      Copy .env.example -> .env and fill in real values." -ForegroundColor Yellow
}

$required = @("DB_URL", "DB_USERNAME", "DB_PASSWORD", "JWT_SECRET")
$missing  = $required | Where-Object { -not (Get-Item "Env:$_" -ErrorAction SilentlyContinue).Value }
if ($missing.Count -gt 0) {
    Write-Host "  [X] Missing required env vars: $($missing -join ', ')" -ForegroundColor Red
    Write-Host "      Set them in .env or your shell, then re-run." -ForegroundColor Red
    exit 1
}

# ── 1. Locate JDK 17 ──────────────────────────────────────────────
$jdkCandidates = @(
    "C:\Users\April John\.jdks\jbr-17.0.14",
    "C:\Program Files\Android\Android Studio\jbr",
    "C:\Program Files\Eclipse Adoptium\jdk-17"
)
$jdk = $null
foreach ($p in $jdkCandidates) {
    if (Test-Path "$p\bin\java.exe") { $jdk = $p; break }
}
if (-not $jdk) {
    Write-Host "  [X] No JDK 17 found. Update the candidates list in this script." -ForegroundColor Red
    exit 1
}

$env:JAVA_HOME = $jdk
$env:Path = "$jdk\bin;" + $env:Path

# ── 2. Use clean tmpdir (workaround for Unix-Domain-Socket bug) ───
if (-not (Test-Path "C:\Temp")) { New-Item -ItemType Directory -Path "C:\Temp" -Force | Out-Null }
$env:TEMP = "C:\Temp"
$env:TMP  = "C:\Temp"

# ── 3. Build JAR if needed ────────────────────────────────────────
$jarPath = "target\unsaidcebu-0.0.1-SNAPSHOT.jar"
$needsBuild = $true
if (Test-Path $jarPath) {
    $jarAge   = (Get-Item $jarPath).LastWriteTime
    $newest   = Get-ChildItem -Path "src" -Recurse -File -ErrorAction SilentlyContinue |
                  Sort-Object LastWriteTime -Descending |
                  Select-Object -First 1
    if ($newest -and $newest.LastWriteTime -lt $jarAge) { $needsBuild = $false }
}

if ($needsBuild) {
    Write-Host "  -> Building JAR with $((java -version 2>&1 | Select-Object -First 1))" -ForegroundColor Cyan
    mvn package -DskipTests -q
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [X] Build failed." -ForegroundColor Red
        exit 1
    }
}

# ── 4. Launch and wait for health endpoint ────────────────────────
Write-Host ""
Write-Host "  ╭──────────────────────────────────────────────╮" -ForegroundColor Magenta
Write-Host "  │  Unsaid Cebu backend  ·  http://localhost:8080  │" -ForegroundColor Magenta
Write-Host "  ╰──────────────────────────────────────────────╯" -ForegroundColor Magenta
Write-Host ""

# Foreground run — easier to read logs & Ctrl-C to stop
java -Djava.io.tmpdir="C:\Temp" -jar $jarPath
