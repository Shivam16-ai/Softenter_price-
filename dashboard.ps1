#!/usr/bin/env pwsh
# SwiftRoute Application Dashboard
# Shows complete system status and quick actions

function Show-Dashboard {
    Clear-Host
    
    Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                              ║" -ForegroundColor Cyan
    Write-Host "║        " -NoNewline -ForegroundColor Cyan
    Write-Host "🚚 SwiftRoute Enterprise - System Dashboard 🚚" -NoNewline -ForegroundColor White
    Write-Host "        ║" -ForegroundColor Cyan
    Write-Host "║                                                              ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    # System Status
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║  📊 SYSTEM STATUS                                            ║" -ForegroundColor Green
    Write-Host "╠══════════════════════════════════════════════════════════════╣" -ForegroundColor Green
    
    # Check Node processes
    $nodeProcess = Get-Process node -ErrorAction SilentlyContinue
    if ($nodeProcess) {
        Write-Host "║  Server: " -NoNewline -ForegroundColor White
        Write-Host "🟢 RUNNING" -NoNewline -ForegroundColor Green
        Write-Host " (PID: $($nodeProcess[0].Id))                          ║" -ForegroundColor White
    } else {
        Write-Host "║  Server: " -NoNewline -ForegroundColor White
        Write-Host "⚪ STOPPED                                           ║" -ForegroundColor Gray
    }
    
    # Check port 3000
    $port3000 = netstat -ano | Select-String ":3000.*LISTENING"
    if ($port3000) {
        Write-Host "║  Port 3000: " -NoNewline -ForegroundColor White
        Write-Host "🟢 LISTENING                                      ║" -ForegroundColor Green
    } else {
        Write-Host "║  Port 3000: " -NoNewline -ForegroundColor White
        Write-Host "⚪ AVAILABLE                                      ║" -ForegroundColor Gray
    }
    
    # Check API health
    Write-Host "║  API Health: " -NoNewline -ForegroundColor White
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
        Write-Host "🟢 HEALTHY                                       ║" -ForegroundColor Green
    } catch {
        Write-Host "⚪ NOT RESPONDING                                ║" -ForegroundColor Gray
    }
    
    # Check database
    if (Test-Path "backend/database/datastore.json") {
        $dbSize = [math]::Round((Get-Item "backend/database/datastore.json").Length / 1KB, 2)
        Write-Host "║  Database: " -NoNewline -ForegroundColor White
        Write-Host "🟢 CONNECTED" -NoNewline -ForegroundColor Green
        Write-Host " ($dbSize KB)                         ║" -ForegroundColor White
    } else {
        Write-Host "║  Database: " -NoNewline -ForegroundColor White
        Write-Host "⚪ NOT FOUND                                     ║" -ForegroundColor Gray
    }
    
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    
    # Quick Stats
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║  📈 QUICK STATS                                              ║" -ForegroundColor Blue
    Write-Host "╠══════════════════════════════════════════════════════════════╣" -ForegroundColor Blue
    
    if (Test-Path "backend/database/datastore.json") {
        $db = Get-Content "backend/database/datastore.json" | ConvertFrom-Json
        Write-Host "║  Total Users: " -NoNewline -ForegroundColor White
        Write-Host "$($db.users.Count)" -NoNewline -ForegroundColor Cyan
        Write-Host " (👤 $($db.users | Where-Object {$_.role -eq 'customer'} | Measure-Object).Count Customers, " -NoNewline -ForegroundColor Gray
        Write-Host "🚚 $($db.users | Where-Object {$_.role -eq 'agent'} | Measure-Object).Count Agents, " -NoNewline -ForegroundColor Gray
        Write-Host "👨‍💼 $($db.users | Where-Object {$_.role -eq 'admin'} | Measure-Object).Count Admins)     ║" -ForegroundColor Gray
        
        Write-Host "║  Total Parcels: " -NoNewline -ForegroundColor White
        Write-Host "$($db.parcels.Count)" -NoNewline -ForegroundColor Cyan
        Write-Host "                                               ║" -ForegroundColor White
        
        $delivered = ($db.parcels | Where-Object {$_.status -eq 'delivered'} | Measure-Object).Count
        $inTransit = ($db.parcels | Where-Object {$_.status -match 'transit|delivery'} | Measure-Object).Count
        $pending = ($db.parcels | Where-Object {$_.status -eq 'pending'} | Measure-Object).Count
        
        Write-Host "║    - Delivered: " -NoNewline -ForegroundColor Gray
        Write-Host "$delivered" -NoNewline -ForegroundColor Green
        Write-Host " | In Transit: " -NoNewline -ForegroundColor Gray
        Write-Host "$inTransit" -NoNewline -ForegroundColor Yellow
        Write-Host " | Pending: " -NoNewline -ForegroundColor Gray
        Write-Host "$pending" -NoNewline -ForegroundColor White
        Write-Host "                 ║" -ForegroundColor White
        
        $totalRevenue = ($db.payments | Measure-Object -Property amount -Sum).Sum
        Write-Host "║  Total Revenue: " -NoNewline -ForegroundColor White
        Write-Host "`$$([math]::Round($totalRevenue, 2))" -NoNewline -ForegroundColor Green
        Write-Host "                                        ║" -ForegroundColor White
        
        Write-Host "║  Payments: " -NoNewline -ForegroundColor White
        Write-Host "$($db.payments.Count)" -NoNewline -ForegroundColor Cyan
        Write-Host " transactions                                     ║" -ForegroundColor White
        
        Write-Host "║  Tracking Events: " -NoNewline -ForegroundColor White
        Write-Host "$($db.parcel_tracking.Count)" -NoNewline -ForegroundColor Cyan
        Write-Host " checkpoints                             ║" -ForegroundColor White
    } else {
        Write-Host "║  Database file not found. Start server to initialize.        ║" -ForegroundColor Yellow
    }
    
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
    
    # Access Information
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║  🌐 ACCESS POINTS                                            ║" -ForegroundColor Magenta
    Write-Host "╠══════════════════════════════════════════════════════════════╣" -ForegroundColor Magenta
    Write-Host "║  Frontend: " -NoNewline -ForegroundColor White
    Write-Host "http://localhost:3000                              ║" -ForegroundColor Cyan
    Write-Host "║  API:      " -NoNewline -ForegroundColor White
    Write-Host "http://localhost:3000/api                         ║" -ForegroundColor Cyan
    Write-Host "║  Health:   " -NoNewline -ForegroundColor White
    Write-Host "http://localhost:3000/api/health                  ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    
    # Test Accounts
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║  👤 TEST ACCOUNTS                                            ║" -ForegroundColor Yellow
    Write-Host "╠══════════════════════════════════════════════════════════════╣" -ForegroundColor Yellow
    Write-Host "║  Admin:    " -NoNewline -ForegroundColor White
    Write-Host "admin@swiftroute.com / admin123                ║" -ForegroundColor Green
    Write-Host "║  Agent:    " -NoNewline -ForegroundColor White
    Write-Host "agent.marcus@swiftroute.com / agent123         ║" -ForegroundColor Green
    Write-Host "║  Customer: " -NoNewline -ForegroundColor White
    Write-Host "customer@swiftroute.com / customer123          ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    
    # Quick Actions
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  ⚡ QUICK ACTIONS                                            ║" -ForegroundColor Cyan
    Write-Host "╠══════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
    Write-Host "║  1. Start Server          2. Stop Server                     ║" -ForegroundColor White
    Write-Host "║  3. Check Status          4. Run Tests                       ║" -ForegroundColor White
    Write-Host "║  5. Open Database         6. View Logs                       ║" -ForegroundColor White
    Write-Host "║  7. Open in Browser       8. Restart Server                  ║" -ForegroundColor White
    Write-Host "║  9. Documentation         0. Exit                            ║" -ForegroundColor White
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    Write-Host ""
}

function Execute-Action {
    param([string]$action)
    
    switch ($action) {
        "1" {
            Write-Host "`n🚀 Starting server..." -ForegroundColor Green
            & ".\swiftroute.ps1" start
        }
        "2" {
            Write-Host "`n🛑 Stopping server..." -ForegroundColor Red
            Stop-Process -Name node -Force -ErrorAction SilentlyContinue
            Write-Host "✅ Server stopped" -ForegroundColor Green
            Start-Sleep -Seconds 2
        }
        "3" {
            Write-Host "`n📊 Checking status..." -ForegroundColor Cyan
            & ".\swiftroute.ps1" status
            Read-Host "`nPress Enter to continue"
        }
        "4" {
            Write-Host "`n🧪 Running tests..." -ForegroundColor Yellow
            & ".\test-app.ps1"
            Read-Host "`nPress Enter to continue"
        }
        "5" {
            Write-Host "`n📊 Opening database..." -ForegroundColor Blue
            if (Test-Path "view-database.html") {
                Start-Process "view-database.html"
                Write-Host "✅ Database viewer opened in browser" -ForegroundColor Green
            } else {
                Write-Host "❌ Database viewer not found" -ForegroundColor Red
            }
            Start-Sleep -Seconds 2
        }
        "6" {
            Write-Host "`n📄 Recent server activity:" -ForegroundColor Cyan
            Write-Host "Check the terminal where server is running for live logs" -ForegroundColor Yellow
            Start-Sleep -Seconds 3
        }
        "7" {
            Write-Host "`n🌐 Opening in browser..." -ForegroundColor Cyan
            Start-Process "http://localhost:3000"
            Write-Host "✅ Browser opened" -ForegroundColor Green
            Start-Sleep -Seconds 2
        }
        "8" {
            Write-Host "`n♻️ Restarting server..." -ForegroundColor Yellow
            Stop-Process -Name node -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
            & ".\swiftroute.ps1" start
        }
        "9" {
            Write-Host "`n📚 Available Documentation:" -ForegroundColor Cyan
            Write-Host "  - README_START_HERE.md" -ForegroundColor White
            Write-Host "  - STARTUP_GUIDE.md" -ForegroundColor White
            Write-Host "  - NEXT_STEPS.md" -ForegroundColor White
            Write-Host "  - DATABASE_SETUP_GUIDE.md" -ForegroundColor White
            Write-Host "  - FINAL_STATUS.md" -ForegroundColor White
            Read-Host "`nPress Enter to continue"
        }
        "0" {
            Write-Host "`n👋 Goodbye!" -ForegroundColor Green
            exit 0
        }
        default {
            Write-Host "`n❌ Invalid option" -ForegroundColor Red
            Start-Sleep -Seconds 1
        }
    }
}

# Main loop
while ($true) {
    Show-Dashboard
    $choice = Read-Host "`nSelect an option (0-9)"
    Execute-Action $choice
}
