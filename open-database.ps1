# SwiftRoute Database Management Script
# Usage: .\open-database.ps1 [option]

param(
    [Parameter(Position=0)]
    [ValidateSet("json", "postgres", "studio", "backup", "restore", "help")]
    [string]$Action = "help"
)

$JsonDbPath = "backend/database/datastore.json"
$BackupPath = "backend/database/datastore.backup.json"

function Show-Help {
    Write-Host "`n=== SwiftRoute Database Manager ===" -ForegroundColor Cyan
    Write-Host "`nUsage: .\open-database.ps1 [option]`n" -ForegroundColor Yellow
    Write-Host "Options:" -ForegroundColor Green
    Write-Host "  json       - Open JSON database in VS Code"
    Write-Host "  postgres   - Connect to PostgreSQL via psql"
    Write-Host "  studio     - Open Prisma Studio (PostgreSQL)"
    Write-Host "  backup     - Backup current JSON database"
    Write-Host "  restore    - Restore from backup"
    Write-Host "  help       - Show this help message"
    Write-Host "`nExamples:" -ForegroundColor Green
    Write-Host "  .\open-database.ps1 json"
    Write-Host "  .\open-database.ps1 backup"
    Write-Host "  .\open-database.ps1 postgres`n"
}

function Open-JsonDatabase {
    Write-Host "`n📂 Opening JSON Database..." -ForegroundColor Cyan
    
    if (Test-Path $JsonDbPath) {
        Write-Host "✅ Database found: $JsonDbPath" -ForegroundColor Green
        
        # Open in VS Code
        code $JsonDbPath
        
        # Show summary
        $db = Get-Content $JsonDbPath | ConvertFrom-Json
        Write-Host "`n📊 Database Summary:" -ForegroundColor Yellow
        Write-Host "  Users: $($db.users.Count)" -ForegroundColor White
        Write-Host "  Parcels: $($db.parcels.Count)" -ForegroundColor White
        Write-Host "  Tracking: $($db.parcel_tracking.Count)" -ForegroundColor White
        Write-Host "  Payments: $($db.payments.Count)" -ForegroundColor White
        Write-Host "  Proofs: $($db.delivery_proofs.Count)" -ForegroundColor White
        Write-Host "  Logs: $($db.activity_logs.Count)`n" -ForegroundColor White
    } else {
        Write-Host "❌ Database not found at: $JsonDbPath" -ForegroundColor Red
        Write-Host "💡 Start the server to create it: npm run dev`n" -ForegroundColor Yellow
    }
}

function Open-PostgreSQL {
    Write-Host "`n🐘 Connecting to PostgreSQL..." -ForegroundColor Cyan
    
    # Check if PostgreSQL is running
    $pgService = Get-Service postgresql* -ErrorAction SilentlyContinue
    
    if ($pgService) {
        if ($pgService.Status -eq "Running") {
            Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
            Write-Host "`nConnecting to database: swiftroute_logistics`n" -ForegroundColor Yellow
            
            # Try to connect
            psql -U postgres -d swiftroute_logistics
        } else {
            Write-Host "⚠️  PostgreSQL service found but not running" -ForegroundColor Yellow
            Write-Host "Starting PostgreSQL..." -ForegroundColor Cyan
            Start-Service $pgService.Name
            Start-Sleep -Seconds 2
            Write-Host "✅ PostgreSQL started`n" -ForegroundColor Green
            psql -U postgres -d swiftroute_logistics
        }
    } else {
        Write-Host "❌ PostgreSQL service not found" -ForegroundColor Red
        Write-Host "💡 Install PostgreSQL: https://www.postgresql.org/download/`n" -ForegroundColor Yellow
    }
}

function Open-PrismaStudio {
    Write-Host "`n🎨 Opening Prisma Studio..." -ForegroundColor Cyan
    Write-Host "This will open at: http://localhost:5555`n" -ForegroundColor Yellow
    
    npx prisma studio
}

function Backup-Database {
    Write-Host "`n💾 Backing up JSON Database..." -ForegroundColor Cyan
    
    if (Test-Path $JsonDbPath) {
        Copy-Item $JsonDbPath $BackupPath -Force
        $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
        $timestampedBackup = "backend/database/datastore.backup.$timestamp.json"
        Copy-Item $JsonDbPath $timestampedBackup -Force
        
        Write-Host "✅ Backup created:" -ForegroundColor Green
        Write-Host "  Latest: $BackupPath" -ForegroundColor White
        Write-Host "  Timestamped: $timestampedBackup`n" -ForegroundColor White
    } else {
        Write-Host "❌ Database not found: $JsonDbPath`n" -ForegroundColor Red
    }
}

function Restore-Database {
    Write-Host "`n♻️  Restoring Database from Backup..." -ForegroundColor Cyan
    
    if (Test-Path $BackupPath) {
        $confirm = Read-Host "⚠️  This will overwrite current database. Continue? (y/N)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            Copy-Item $BackupPath $JsonDbPath -Force
            Write-Host "✅ Database restored from: $BackupPath`n" -ForegroundColor Green
        } else {
            Write-Host "❌ Restore cancelled`n" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Backup not found: $BackupPath`n" -ForegroundColor Red
        Write-Host "💡 Create a backup first: .\open-database.ps1 backup`n" -ForegroundColor Yellow
    }
}

# Main execution
switch ($Action) {
    "json" { Open-JsonDatabase }
    "postgres" { Open-PostgreSQL }
    "studio" { Open-PrismaStudio }
    "backup" { Backup-Database }
    "restore" { Restore-Database }
    "help" { Show-Help }
    default { Show-Help }
}
