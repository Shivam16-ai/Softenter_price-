#!/usr/bin/env pwsh
# SwiftRoute Master Control Script
# One script to rule them all

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "test", "stop", "status", "db", "help", "menu")]
    [string]$Command = "menu"
)

function Show-Banner {
    Clear-Host
    Write-Host ""
    Write-Host "  ╔════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║                                                    ║" -ForegroundColor Cyan
    Write-Host "  ║     " -NoNewline -ForegroundColor Cyan
    Write-Host "🚚 SwiftRoute Enterprise Management 🚚" -NoNewline -ForegroundColor White
    Write-Host "     ║" -ForegroundColor Cyan
    Write-Host "  ║                                                    ║" -ForegroundColor Cyan
    Write-Host "  ║         Enterprise Parcel Management System        ║" -ForegroundColor Cyan
    Write-Host "  ║                                                    ║" -ForegroundColor Cyan
    Write-Host "  ╚════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Menu {
    Show-Banner
    Write-Host "  Available Commands:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "    1. " -NoNewline -ForegroundColor White
    Write-Host "start   " -NoNewline -ForegroundColor Green
    Write-Host "- Start the server (clean)" -ForegroundColor Gray
    
    Write-Host "    2. " -NoNewline -ForegroundColor White
    Write-Host "test    " -NoNewline -ForegroundColor Green
    Write-Host "- Run system tests" -ForegroundColor Gray
    
    Write-Host "    3. " -NoNewline -ForegroundColor White
    Write-Host "stop    " -NoNewline -ForegroundColor Green
    Write-Host "- Stop all Node processes" -ForegroundColor Gray
    
    Write-Host "    4. " -NoNewline -ForegroundColor White
    Write-Host "status  " -NoNewline -ForegroundColor Green
    Write-Host "- Check server status" -ForegroundColor Gray
    
    Write-Host "    5. " -NoNewline -ForegroundColor White
    Write-Host "db      " -NoNewline -ForegroundColor Green
    Write-Host "- Open database viewer" -ForegroundColor Gray
    
    Write-Host "    6. " -NoNewline -ForegroundColor White
    Write-Host "help    " -NoNewline -ForegroundColor Green
    Write-Host "- Show detailed help" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "  Usage: " -NoNewline -ForegroundColor Yellow
    Write-Host ".\swiftroute.ps1 [command]" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "  Select an option (1-6) or press Enter to exit"
    
    switch ($choice) {
        "1" { Start-Server }
        "2" { Run-Tests }
        "3" { Stop-Server }
        "4" { Check-Status }
        "5" { Open-Database }
        "6" { Show-Help }
        "" { exit 0 }
        default { 
            Write-Host "`n  ❌ Invalid option. Press Enter to continue..." -ForegroundColor Red
            Read-Host
            Show-Menu
        }
    }
}

function Start-Server {
    Show-Banner
    Write-Host "  🚀 Starting SwiftRoute Server..." -ForegroundColor Cyan
    Write-Host ""
    
    # Clean processes
    Write-Host "  [1/3] Cleaning up processes..." -ForegroundColor Yellow
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "  ✅ Cleanup complete" -ForegroundColor Green
    
    # Check ports
    Write-Host "`n  [2/3] Verifying ports..." -ForegroundColor Yellow
    $port3000 = netstat -ano | Select-String ":3000.*LISTENING"
    $port24678 = netstat -ano | Select-String ":24678.*LISTENING"
    
    if ($port3000 -or $port24678) {
        Write-Host "  ⚠️  Ports still in use, forcing cleanup..." -ForegroundColor Yellow
        if ($port3000) {
            $port3000 -match "LISTENING\s+(\d+)" | Out-Null
            Stop-Process -Id $matches[1] -Force -ErrorAction SilentlyContinue
        }
        if ($port24678) {
            $port24678 -match "LISTENING\s+(\d+)" | Out-Null
            Stop-Process -Id $matches[1] -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 2
    }
    Write-Host "  ✅ Ports available" -ForegroundColor Green
    
    # Start server
    Write-Host "`n  [3/3] Launching server..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  ╔════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "  ║      Server Information                ║" -ForegroundColor Green
    Write-Host "  ╠════════════════════════════════════════╣" -ForegroundColor Green
    Write-Host "  ║  URL: " -NoNewline -ForegroundColor White
    Write-Host "http://localhost:3000           " -NoNewline -ForegroundColor Cyan
    Write-Host "║" -ForegroundColor Green
    Write-Host "  ║  API: " -NoNewline -ForegroundColor White
    Write-Host "http://localhost:3000/api      " -NoNewline -ForegroundColor Cyan
    Write-Host "║" -ForegroundColor Green
    Write-Host "  ╠════════════════════════════════════════╣" -ForegroundColor Green
    Write-Host "  ║  Press Ctrl+C to stop                  ║" -ForegroundColor Yellow
    Write-Host "  ╚════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    npm run dev
}

function Run-Tests {
    Show-Banner
    Write-Host "  🧪 Running System Tests..." -ForegroundColor Cyan
    Write-Host ""
    
    & ".\test-app.ps1"
    
    Write-Host ""
    Read-Host "  Press Enter to continue"
    Show-Menu
}

function Stop-Server {
    Show-Banner
    Write-Host "  🛑 Stopping SwiftRoute Server..." -ForegroundColor Cyan
    Write-Host ""
    
    $nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $count = ($nodeProcesses | Measure-Object).Count
        Write-Host "  Found $count Node process(es)" -ForegroundColor Yellow
        Stop-Process -Name node -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "  ✅ All processes stopped" -ForegroundColor Green
    } else {
        Write-Host "  ℹ️  No Node processes running" -ForegroundColor White
    }
    
    Write-Host ""
    Read-Host "  Press Enter to continue"
    Show-Menu
}

function Check-Status {
    Show-Banner
    Write-Host "  📊 System Status Check" -ForegroundColor Cyan
    Write-Host ""
    
    # Check Node processes
    Write-Host "  Node.js Processes:" -ForegroundColor Yellow
    $nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $nodeProcesses | ForEach-Object {
            Write-Host "    ✅ PID: $($_.Id) - CPU: $([math]::Round($_.CPU, 2))s" -ForegroundColor Green
        }
    } else {
        Write-Host "    ⚪ No Node processes running" -ForegroundColor Gray
    }
    
    # Check ports
    Write-Host "`n  Port Status:" -ForegroundColor Yellow
    $port3000 = netstat -ano | Select-String ":3000.*LISTENING"
    $port24678 = netstat -ano | Select-String ":24678.*LISTENING"
    
    if ($port3000) {
        Write-Host "    ✅ Port 3000: IN USE" -ForegroundColor Green
    } else {
        Write-Host "    ⚪ Port 3000: Available" -ForegroundColor Gray
    }
    
    if ($port24678) {
        Write-Host "    ✅ Port 24678: IN USE (Vite HMR)" -ForegroundColor Green
    } else {
        Write-Host "    ⚪ Port 24678: Available" -ForegroundColor Gray
    }
    
    # Test API
    Write-Host "`n  API Health Check:" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "    ✅ API responding (Status: 200)" -ForegroundColor Green
        }
    } catch {
        Write-Host "    ❌ API not responding" -ForegroundColor Red
    }
    
    Write-Host ""
    Read-Host "  Press Enter to continue"
    Show-Menu
}

function Open-Database {
    Show-Banner
    Write-Host "  📊 Opening Database Viewer..." -ForegroundColor Cyan
    Write-Host ""
    
    if (Test-Path "view-database.html") {
        Start-Process "view-database.html"
        Write-Host "  ✅ Database viewer opened in browser" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Database viewer not found" -ForegroundColor Red
    }
    
    Write-Host ""
    Read-Host "  Press Enter to continue"
    Show-Menu
}

function Show-Help {
    Show-Banner
    Write-Host "  📖 SwiftRoute Help" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Quick Start:" -ForegroundColor Yellow
    Write-Host "    1. Run: " -NoNewline
    Write-Host ".\swiftroute.ps1 start" -ForegroundColor Green
    Write-Host "    2. Open: " -NoNewline
    Write-Host "http://localhost:3000" -ForegroundColor Cyan
    
    Write-Host "`n  Test Accounts:" -ForegroundColor Yellow
    Write-Host "    Admin:    " -NoNewline
    Write-Host "admin@swiftroute.com / admin123" -ForegroundColor White
    Write-Host "    Agent:    " -NoNewline
    Write-Host "agent.marcus@swiftroute.com / agent123" -ForegroundColor White
    Write-Host "    Customer: " -NoNewline
    Write-Host "customer@swiftroute.com / customer123" -ForegroundColor White
    
    Write-Host "`n  Documentation:" -ForegroundColor Yellow
    Write-Host "    - STARTUP_GUIDE.md    (Complete guide)"
    Write-Host "    - DATABASE_SETUP_GUIDE.md  (Database info)"
    Write-Host "    - FIX_PORT_ERROR.md   (Troubleshooting)"
    
    Write-Host ""
    Read-Host "  Press Enter to continue"
    Show-Menu
}

# Main execution
switch ($Command) {
    "start"  { Start-Server }
    "test"   { Run-Tests }
    "stop"   { Stop-Server }
    "status" { Check-Status }
    "db"     { Open-Database }
    "help"   { Show-Help }
    "menu"   { Show-Menu }
}
