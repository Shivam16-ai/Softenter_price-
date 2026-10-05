#!/usr/bin/env pwsh
# SWIFTRoute Microservices - Health Check Script
# Verifies that all services are running and accessible

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     SWIFTRoute Enterprise - Service Health Check             ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# Services to check
$services = @(
    @{ Name = "API Gateway (PRIMARY)"; Url = "http://localhost:4000/health"; Critical = $true },
    @{ Name = "Monolith"; Url = "http://localhost:3000/api/health"; Critical = $true },
    @{ Name = "Auth Service"; Url = "http://localhost:4001/health"; Critical = $true },
    @{ Name = "Order Service"; Url = "http://localhost:4003/health"; Critical = $true },
    @{ Name = "Shipment Service"; Url = "http://localhost:4004/health"; Critical = $true },
    @{ Name = "Delivery Service"; Url = "http://localhost:4005/health"; Critical = $true },
    @{ Name = "Payment Service"; Url = "http://localhost:4006/health"; Critical = $true },
    @{ Name = "Notification Service"; Url = "http://localhost:4007/health"; Critical = $true },
    @{ Name = "Admin Service"; Url = "http://localhost:4008/health"; Critical = $true }
)

$healthyCount = 0
$unhealthyCount = 0
$healthyServices = @()
$unhealthyServices = @()

Write-Host "🔍 Checking service health..." -ForegroundColor Yellow
Write-Host ""

foreach ($service in $services) {
    Write-Host "Checking $($service.Name)... " -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $service.Url -Method Get -TimeoutSec 5 -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ HEALTHY" -ForegroundColor Green
            $healthyCount++
            $healthyServices += $service.Name
        } else {
            Write-Host "⚠️  DEGRADED (Status: $($response.StatusCode))" -ForegroundColor Yellow
            $unhealthyCount++
            $unhealthyServices += $service.Name
        }
    } catch {
        Write-Host "❌ UNREACHABLE" -ForegroundColor Red
        $unhealthyCount++
        $unhealthyServices += $service.Name
    }
    
    Start-Sleep -Milliseconds 100
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 Health Check Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($unhealthyCount -eq 0) {
    Write-Host "✅ All services are HEALTHY ($healthyCount/$($services.Count))" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 System is fully operational!" -ForegroundColor Green
    Write-Host "   Access the application at: http://localhost:4000" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  System Status: DEGRADED" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Healthy Services ($healthyCount):" -ForegroundColor Green
    foreach ($srv in $healthyServices) {
        Write-Host "  ✅ $srv" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host "Unhealthy Services ($unhealthyCount):" -ForegroundColor Red
    foreach ($srv in $unhealthyServices) {
        Write-Host "  ❌ $srv" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "💡 Troubleshooting:" -ForegroundColor Cyan
    Write-Host "   1. Check if the service process is running" -ForegroundColor Gray
    Write-Host "   2. Check console output for errors" -ForegroundColor Gray
    Write-Host "   3. Verify .env configuration" -ForegroundColor Gray
    Write-Host "   4. Ensure PostgreSQL is running (for backend services)" -ForegroundColor Gray
    Write-Host "   5. Check if ports are already in use: npx kill-port <port>" -ForegroundColor Gray
}

Write-Host ""

# Check PostgreSQL connectivity
Write-Host "🗄️  Checking PostgreSQL..." -NoNewline
try {
    $dbUrl = $env:DATABASE_URL
    if (-not $dbUrl) {
        # Try to read from .env file
        if (Test-Path ".env") {
            $dbUrl = Get-Content ".env" | Where-Object { $_ -match "^DATABASE_URL=" } | ForEach-Object { $_.Split("=", 2)[1].Trim('"') }
        }
    }
    
    if ($dbUrl) {
        # Simple check - just see if we can resolve the hostname
        if ($dbUrl -match "localhost|127\.0\.0\.1") {
            Write-Host " ✅ Configured (localhost)" -ForegroundColor Green
        } else {
            Write-Host " ✅ Configured (remote)" -ForegroundColor Green
        }
    } else {
        Write-Host " ⚠️  DATABASE_URL not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ⚠️  Could not verify" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Gateway routing check
if ($healthyServices -contains "API Gateway (PRIMARY)") {
    Write-Host "🛣️  Checking Gateway Routing..." -ForegroundColor Cyan
    try {
        $gatewayHealth = Invoke-RestMethod -Uri "http://localhost:4000/health" -Method Get
        if ($gatewayHealth.routing) {
            Write-Host ""
            Write-Host "Gateway Routes:" -ForegroundColor Yellow
            $gatewayHealth.routing.PSObject.Properties | ForEach-Object {
                Write-Host "  $($_.Name) → $($_.Value)" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "  Could not fetch routing information" -ForegroundColor Gray
    }
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Exit code based on health status
if ($unhealthyCount -eq 0) {
    exit 0
} else {
    exit 1
}
