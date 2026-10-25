# SMAX SELF developer QA on Windows. Read-only except ignored dist/ outputs.
# This does not deploy, sell, or send customer files.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$ok = $false
Push-Location $repo
try {
    if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) {
        throw 'Node.js 20+ is required for developer QA; customer does not need Node.'
    }
    if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
        throw 'npm.cmd was not found on PATH.'
    }
    $nodeMajorText = (& node.exe -p 'process.versions.node.split(".")[0]').Trim()
    $nodeMajor = [int]$nodeMajorText
    if ($nodeMajor -lt 20) {
        throw "Node.js 20+ required; detected major version $nodeMajor"
    }

    Write-Host "[SMAX SELF] Running full Node tests, private offline build and release gate..."
    & npm.cmd run qa:release
    $status = $LASTEXITCODE
    if ($status -ne 0) {
        throw "Release QA failed (exit $status). Do not deliver or publish."
    }

    $reportPath = Join-Path $repo 'dist\SELF_QA_REPORT.json'
    $htmlPath = Join-Path $repo 'dist\SMAX_SELF_OFFLINE.html'
    if (-not (Test-Path -LiteralPath $reportPath -PathType Leaf)) {
        throw 'Release report was not produced.'
    }
    if (-not (Test-Path -LiteralPath $htmlPath -PathType Leaf)) {
        throw 'Offline HTML was not produced.'
    }
    $report = Get-Content -LiteralPath $reportPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($report.status -ne 'LOCAL_NODE_PASS_BROWSER_NOT_TESTED') {
        throw "Unexpected release QA status: $($report.status)"
    }
    $actualSha = (Get-FileHash -LiteralPath $htmlPath -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($actualSha -ne $report.sha256.ToLowerInvariant()) {
        throw 'Offline HTML SHA256 does not match the QA report.'
    }
    $actualBytes = (Get-Item -LiteralPath $htmlPath).Length
    if ($actualBytes -ne [long]$report.bytes) {
        throw 'Offline HTML byte count does not match the QA report.'
    }
    $ok = $true
    Write-Host ""
    Write-Host "[SMAX SELF] Node QA + build PASS. Offline HTML:"
    Write-Host "  $htmlPath"
    Write-Host "  SHA256: $actualSha"
    Write-Host "  Bytes:  $actualBytes"
    Write-Host "[IMPORTANT] Windows Edge/Chrome file:// and CSV download have NOT been tested by this command."
    Write-Host "Run Python Playwright E2E or follow docs/SELF_CUSTOMER_QUICKSTART_20261025.md"
    Write-Host "Release/sale approval: NOT GRANTED."
} catch {
    Write-Error ("[SMAX SELF] BLOCKED/FAIL: " + $_.Exception.Message)
} finally {
    Pop-Location
}
if (-not $ok) { exit 1 }
exit 0
