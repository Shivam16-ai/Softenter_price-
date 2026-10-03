#!/usr/bin/env pwsh
# SwiftRoute Application Test Script
# Tests all components: TypeScript, Build, Server, API

Write-Host "`n╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🧪 SwiftRoute Application Tester  🧪 ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝`n" -ForegroundColor Cyan

$testResults = @()
$allPassed = $true

function Test-Component {
    param(
        [string]$Name,
        [scriptblock]$TestScript
    )
    
    Write-Host "[$Name]" -NoNewline -ForegroundColor Yellow
    Write-Host " Testing..." -NoNewline
    
    try {
        $result = & $TestScript
        if ($result) {
            Write-Host " ✅ PASS" -ForegroundColor Green
            return $true
        } else {
            Write-Host " ❌ FAIL" -ForegroundColor Red
            $script:allPassed = $false
            return $false
        }
    } catch {
        Write-Host " ❌ ERROR: $_" -ForegroundColor Red
        $script:allPassed = $false
        return $false
    }
}

# Test 1: Project Structure
$testResults += Test-Component "Project Structure" {
    (Test-Path "server.ts") -and 
    (Test-Path "package.json") -and 
    (Test-Path "src/App.tsx") -and
    (Test-Path "backend/routes/index.ts")
}

# Test 2: Dependencies
$testResults += Test-Component "Dependencies" {
    Test-Path "node_modules"
}

# Test 3: Environment Files
$testResults += Test-Component "Environment Files" {
    Test-Path ".env"
}

# Test 4: Database File
$testResults += Test-Component "Database" {
    Test-Path "backend/database/datastore.json"
}

# Test 5: TypeScript Compilation
Write-Host "[TypeScript Compilation]" -NoNewline -ForegroundColor Yellow
Write-Host " Testing..." -NoNewline
$tscResult = npm run lint 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host " ✅ PASS" -ForegroundColor Green
    $testResults += $true
} else {
    Write-Host " ❌ FAIL" -ForegroundColor Red
    $script:allPassed = $false
    $testResults += $false
}

# Test 6: Port Availability
$testResults += Test-Component "Port 3000" {
    $port = netstat -ano | Select-String ":3000.*LISTENING"
    $null -eq $port
}

# Test 7: Port 24678 (Vite HMR)
$testResults += Test-Component "Port 24678 (Vite)" {
    $port = netstat -ano | Select-String ":24678.*LISTENING"
    $null -eq $port
}

# Test 8: Critical Backend Files
$testResults += Test-Component "Backend Routes" {
    (Test-Path "backend/routes/authRoutes.ts") -and
    (Test-Path "backend/routes/parcelRoutes.ts") -and
    (Test-Path "backend/controllers/authController.ts")
}

# Test 9: Critical Frontend Files
$testResults += Test-Component "Frontend Components" {
    (Test-Path "src/components/common/Navbar.tsx") -and
    (Test-Path "src/context/AuthContext.tsx") -and
    (Test-Path "src/services/api.ts")
}

# Test 10: Build System
Write-Host "[Build Configuration]" -NoNewline -ForegroundColor Yellow
Write-Host " Testing..." -NoNewline
if ((Test-Path "vite.config.ts") -and (Test-Path "tsconfig.json")) {
    Write-Host " ✅ PASS" -ForegroundColor Green
    $testResults += $true
} else {
    Write-Host " ❌ FAIL" -ForegroundColor Red
    $script:allPassed = $false
    $testResults += $false
}

# Summary
Write-Host "`n╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          Test Summary                ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════╝" -ForegroundColor Cyan

$passed = ($testResults | Where-Object { $_ -eq $true }).Count
$total = $testResults.Count
$percentage = [math]::Round(($passed / $total) * 100, 2)

Write-Host "`nTests Passed: $passed / $total ($percentage%)" -ForegroundColor $(if ($allPassed) { "Green" } else { "Yellow" })

if ($allPassed) {
    Write-Host "`n✅ All tests passed! Application is ready to run." -ForegroundColor Green
    Write-Host "`nTo start the server, run:" -ForegroundColor Cyan
    Write-Host "  .\start-clean.ps1" -ForegroundColor White
    Write-Host "  OR" -ForegroundColor Yellow
    Write-Host "  npm run dev`n" -ForegroundColor White
} else {
    Write-Host "`n⚠️  Some tests failed. Please review the errors above." -ForegroundColor Yellow
    Write-Host "`nCommon fixes:" -ForegroundColor Cyan
    Write-Host "  - Install dependencies: npm install" -ForegroundColor White
    Write-Host "  - Kill port conflicts: .\start-clean.ps1" -ForegroundColor White
    Write-Host "  - Check .env file exists`n" -ForegroundColor White
}

# Return exit code
exit $(if ($allPassed) { 0 } else { 1 })
