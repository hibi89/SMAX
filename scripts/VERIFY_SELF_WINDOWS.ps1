# SMAX SELF developer QA on Windows. Read-only except ignored dist/ outputs.
# This does not deploy, sell, or send customer files.
# Invoke with -EdgeE2E to run additional actual Edge file:// tests when Playwright is available.
param([switch]$EdgeE2E)
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
    $nodeVersion = (& node.exe -p "process.versions.node").Trim()
    $nodeMajor = [int](($nodeVersion -split '\.')[0])
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
    # Both actual offline tools must have current release evidence.
    # Reject reports from older Node-only builds even if HTML hash matches.
    $required = @(
        'allNodeTests',
        'offlineBuild',
        'cssAndScriptCsp',
        'publicPrivateBoundary',
        'syntheticCsv4Rows2Review',
        'syntheticSales5Rows3Review'
    )
    foreach ($name in $required) {
        $entry = $report.verification.PSObject.Properties[$name]
        if ($null -eq $entry -or $entry.Value -ne 'PASS') {
            throw "Release QA report missing required PASS evidence: $name"
        }
    }
    if ($report.verification.saleApproval -ne 'NOT_GRANTED') {
        throw 'Release report must not claim sale approval.'
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
    if ($EdgeE2E) {
        Write-Host "[SMAX SELF] Running actual Edge offline file:// QA (developer Playwright required)..."
        & npm.cmd run qa:browser:node -- --channel msedge
        $browserExit = $LASTEXITCODE
        if ($browserExit -ne 0) {
            throw "Edge E2E failed or blocked (exit $browserExit). Do not distribute."
        }
        Write-Host "[SMAX SELF] Edge automated file:// E2E PASS against release-QA-matched HTML."
        Write-Host "[IMPORTANT] Manual Windows usability, customer delivery and sale approval still NOT GRANTED."
    } else {
        Write-Host "[IMPORTANT] Windows Edge/Chrome file:// and CSV downloads NOT TESTED."
        Write-Host "To run real Edge automation: QA_SELF_WINDOWS.cmd /edge (developer Playwright required)."
    }
    Write-Host "Release/sale approval: NOT GRANTED."
} catch {
    Write-Error ("[SMAX SELF] BLOCKED/FAIL: " + $_.Exception.Message)
} finally {
    Pop-Location
}
if (-not $ok) { exit 1 }
exit 0
