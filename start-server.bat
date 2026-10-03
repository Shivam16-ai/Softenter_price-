@echo off
REM SwiftRoute Server Starter - Windows Batch Version

echo.
echo ======================================
echo    SwiftRoute Server Starter
echo ======================================
echo.

REM Check if we're in the right directory
if not exist "server.ts" (
    echo ERROR: server.ts not found!
    echo Please run this script from the project root directory.
    echo.
    pause
    exit /b 1
)

echo Stopping existing Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Starting server...
echo.
echo Server will run at: http://localhost:3000
echo API endpoint: http://localhost:3000/api/health
echo.
echo Press Ctrl+C to stop the server
echo.
echo ======================================
echo.

npm run dev
