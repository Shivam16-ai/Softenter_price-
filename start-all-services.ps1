#!/usr/bin/env pwsh
# SWIFTRoute Microservices - Start All Services Script
# This script starts all 9 services in separate PowerShell windows

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     SWIFTRoute Enterprise - Microservices Startup Script      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Check if PostgreSQL is accessible
Write-Host "🔍 Checking PostgreSQL connection..." -ForegroundColor Yellow
try {
    $dbCheck = psql -U postgres -h localhost -p 5432 -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ WARNING: Cannot connect to PostgreSQL on localhost:5432" -ForegroundColor Red
    Write-Host "   Please ensure PostgreSQL is running before starting services." -ForegroundColor Red
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host ""
Write-Host "📦 Starting all services in separate windows..." -ForegroundColor Cyan
Write-Host ""

# Function to start a service in a new window
function Start-Service {
    param (
        [string]$ServiceName,
        [string]$Path,
        [string]$Command,
        [int]$Port
    )
    
    Write-Host "🚀 Starting $ServiceName on port $Port..." -ForegroundColor Green
    
    $scriptBlock = @"
Write-Host '═══════════════════════════════════════════════════════════' -ForegroundColor Cyan
Write-Host ' $ServiceName' -ForegroundColor Yellow
Write-Host ' Port: $Port' -ForegroundColor Yellow
Write-Host '═══════════════════════════════════════════════════════════' -ForegroundColor Cyan
Write-Host ''
Set-Location '$Path'
$Command
"@
    
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", $scriptBlock
    Start-Sleep -Milliseconds 500
}

# Get the project root directory
$projectRoot = $PSScriptRoot

# 1. Start Monolith (Frontend + Fallback APIs) - Port 3000
Start-Service -ServiceName "Monolith (Frontend + Fallback)" `
              -Path $projectRoot `
              -Command "npm run dev" `
              -Port 3000

Start-Sleep -Seconds 3

# 2. Start API Gateway - Port 4000 (PRIMARY ENTRY POINT)
Start-Service -ServiceName "API Gateway (PRIMARY ENTRY)" `
              -Path "$projectRoot\gateway" `
              -Command "npm run dev" `
              -Port 4000

Start-Sleep -Seconds 2

# 3. Start Auth Service - Port 4001
Start-Service -ServiceName "Auth Service" `
              -Path "$projectRoot\services\auth-service" `
              -Command "npm run dev" `
              -Port 4001

Start-Sleep -Seconds 1

# 4. Start Order Service - Port 4003
Start-Service -ServiceName "Order Service" `
              -Path "$projectRoot\services\order-service" `
              -Command "npm run dev" `
              -Port 4003

Start-Sleep -Seconds 1

# 5. Start Shipment Service - Port 4004
Start-Service -ServiceName "Shipment Service" `
              -Path "$projectRoot\services\shipment-service" `
              -Command "npm run dev" `
              -Port 4004

Start-Sleep -Seconds 1

# 6. Start Delivery Service - Port 4005
Start-Service -ServiceName "Delivery Service" `
              -Path "$projectRoot\services\delivery-service" `
              -Command "npm run dev" `
              -Port 4005

Start-Sleep -Seconds 1

# 7. Start Payment Service - Port 4006
Start-Service -ServiceName "Payment Service" `
              -Path "$projectRoot\services\payment-service" `
              -Command "npm run dev" `
              -Port 4006

Start-Sleep -Seconds 1

# 8. Start Notification Service - Port 4007
Start-Service -ServiceName "Notification Service" `
              -Path "$projectRoot\services\notification-service" `
              -Command "npm run dev" `
              -Port 4007

Start-Sleep -Seconds 1

# 9. Start Admin Service - Port 4008
Start-Service -ServiceName "Admin Service" `
              -Path "$projectRoot\services\admin-service" `
              -Command "npm run dev" `
              -Port 4008

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ All services are starting up!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Please wait 10-15 seconds for all services to initialize..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 PRIMARY URL: " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:4000" -ForegroundColor Yellow -BackgroundColor Black
Write-Host ""
Write-Host "📋 Service Status:" -ForegroundColor Cyan
Write-Host "   Monolith (Frontend):    http://localhost:3000 (internal only)" -ForegroundColor Gray
Write-Host "   API Gateway:            http://localhost:4000 ← USE THIS" -ForegroundColor Green
Write-Host "   Auth Service:           http://localhost:4001/health" -ForegroundColor Gray
Write-Host "   Order Service:          http://localhost:4003/health" -ForegroundColor Gray
Write-Host "   Shipment Service:       http://localhost:4004/health" -ForegroundColor Gray
Write-Host "   Delivery Service:       http://localhost:4005/health" -ForegroundColor Gray
Write-Host "   Payment Service:        http://localhost:4006/health" -ForegroundColor Gray
Write-Host "   Notification Service:   http://localhost:4007/health" -ForegroundColor Gray
Write-Host "   Admin Service:          http://localhost:4008/health" -ForegroundColor Gray
Write-Host ""
Write-Host "🔐 Default Admin Login:" -ForegroundColor Cyan
Write-Host "   Email:    admin@swiftroute.com" -ForegroundColor Gray
Write-Host "   Password: Admin@123" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 To verify all services are healthy, run:" -ForegroundColor Cyan
Write-Host "   .\check-services-health.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "🛑 To stop all services, close each PowerShell window manually." -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this startup script..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
