#!/usr/bin/env pwsh
# SwiftRoute Clean Startup Script
# Ensures all ports are free and starts the server cleanly

Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 SwiftRoute Clean Server Startup 🚀  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Step 1: Verify we're in the correct directory
Write-Host "[1/6] 📂 Verifying directory..." -ForegroundColor Yellow
if (!(Test-Path "server.ts") -or !(Test-Path "package.json")) {
    Write-Host "❌ ERROR: Not in project root directory!" -ForegroundColor Red
    Write-Host "Please run this script from: swiftroute-enterprise-parcel-management (1)`n" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ Correct directory confirmed`n" -ForegroundColor Green

# Step 2: Kill all Node.js processes
Write-Host "[2/6] 🔪 Terminating existing Node processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $count = ($nodeProcesses | Measure-Object).Count
    Write-Host "   Found $count Node process(es). Stopping..." -ForegroundColor White
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "✅ All Node processes terminated`n" -ForegroundColor Green
} else {
    Write-Host "✅ No Node processes running`n" -ForegroundColor Green
}

# Step 3: Free port 3000
Write-Host "[3/6] 🔓 Checking port 3000..." -ForegroundColor Yellow
$port3000 = netstat -ano | Select-String ":3000.*LISTENING"
if ($port3000) {
    $port3000 -match "LISTENING\s+(\d+)" | Out-Null
    $pid = $matches[1]
    Write-Host "   Port 3000 occupied by PID $pid. Freeing..." -ForegroundColor White
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "✅ Port 3000 freed`n" -ForegroundColor Green
} else {
    Write-Host "✅ Port 3000 is available`n" -ForegroundColor Green
}

# Step 4: Free port 24678 (Vite HMR WebSocket)
Write-Host "[4/6] 🔓 Checking port 24678 (Vite HMR)..." -ForegroundColor Yellow
$port24678 = netstat -ano | Select-String ":24678.*LISTENING"
if ($port24678) {
    $port24678 -match "LISTENING\s+(\d+)" | Out-Null
    $pid = $matches[1]
    Write-Host "   Port 24678 occupied by PID $pid. Freeing..." -ForegroundColor White
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "✅ Port 24678 freed`n" -ForegroundColor Green
} else {
    Write-Host "✅ Port 24678 is available`n" -ForegroundColor Green
}

# Step 5: Verify environment
Write-Host "[5/6] ⚙️  Checking environment..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found, using defaults" -ForegroundColor Yellow
}
if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies installed`n" -ForegroundColor Green
} else {
    Write-Host "❌ node_modules not found!" -ForegroundColor Red
    Write-Host "   Running: npm install...`n" -ForegroundColor Yellow
    npm install
}

# Step 6: Start the server
Write-Host "[6/6] 🚀 Starting SwiftRoute server...`n" -ForegroundColor Yellow
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          🌐 Server Information 🌐          ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  Frontend: http://localhost:3000           ║" -ForegroundColor White
Write-Host "║  API:      http://localhost:3000/api       ║" -ForegroundColor White
Write-Host "║  Health:   http://localhost:3000/api/health║" -ForegroundColor White
Write-Host "╠════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  Press Ctrl+C to stop the server           ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Green

# Start the development server
npm run dev
