#!/usr/bin/env pwsh
# SwiftRoute Server Starter Script
# This script ensures a clean start by killing existing processes first

Write-Host "`n🚀 SwiftRoute Server Starter" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if we're in the right directory
$currentDir = Get-Location
if (!(Test-Path "server.ts")) {
    Write-Host "❌ Error: server.ts not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory.`n" -ForegroundColor Yellow
    exit 1
}

# Step 1: Kill existing Node processes
Write-Host "🔍 Checking for existing Node processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "⚠️  Found running Node processes. Stopping them..." -ForegroundColor Yellow
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "✅ Processes stopped" -ForegroundColor Green
} else {
    Write-Host "✅ No existing Node processes found" -ForegroundColor Green
}

# Step 2: Check if port 3000 is available
Write-Host "`n🔍 Checking port availability..." -ForegroundColor Yellow
$portCheck = netstat -ano | Select-String ":3000"

if ($portCheck) {
    Write-Host "⚠️  Port 3000 is still in use. Attempting to free it..." -ForegroundColor Yellow
    $portCheck -match "LISTENING\s+(\d+)" | Out-Null
    if ($matches) {
        $pid = $matches[1]
        Write-Host "   Killing process $pid..." -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "✅ Port 3000 freed" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Port 3000 is available" -ForegroundColor Green
}

# Step 3: Start the server
Write-Host "`n🚀 Starting SwiftRoute server..." -ForegroundColor Cyan
Write-Host "   URL: http://localhost:3000" -ForegroundColor White
Write-Host "   API: http://localhost:3000/api/health" -ForegroundColor White
Write-Host "`n   Press Ctrl+C to stop the server`n" -ForegroundColor Yellow
Write-Host "================================`n" -ForegroundColor Cyan

# Start the server
npm run dev
