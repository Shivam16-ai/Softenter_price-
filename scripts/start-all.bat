@echo off
REM ============================================================
REM  SwiftRoute — Start All Microservices (Windows Dev Script)
REM ============================================================
REM  This script starts each service in a separate terminal window.
REM  Run from the project root: scripts\start-all.bat
REM
REM  Port Allocation:
REM    3000 — Monolith (React SPA + Vite)
REM    4000 — API Gateway
REM    4001 — Auth Service
REM    4003 — Order Service
REM    4004 — Shipment Service
REM    4005 — Delivery Service
REM    4006 — Payment Service
REM    4007 — Notification Service
REM    4008 — Admin Service
REM ============================================================

set ROOT=%~dp0..

echo [SwiftRoute] Starting all microservices...
echo.

REM ── Monolith (React + Vite + Express)
start "SwiftRoute - Monolith :3000" cmd /k "cd /d %ROOT% && npm run dev"

timeout /t 3 /nobreak >nul

REM ── Auth Service
start "SwiftRoute - Auth :4001" cmd /k "cd /d %ROOT%\services\auth-service && npm run dev"

REM ── Order Service
start "SwiftRoute - Order :4003" cmd /k "cd /d %ROOT%\services\order-service && npm run dev"

REM ── Shipment Service
start "SwiftRoute - Shipment :4004" cmd /k "cd /d %ROOT%\services\shipment-service && npm run dev"

REM ── Delivery Service
start "SwiftRoute - Delivery :4005" cmd /k "cd /d %ROOT%\services\delivery-service && npm run dev"

REM ── Payment Service
start "SwiftRoute - Payment :4006" cmd /k "cd /d %ROOT%\services\payment-service && npm run dev"

REM ── Notification Service
start "SwiftRoute - Notification :4007" cmd /k "cd /d %ROOT%\services\notification-service && npm run dev"

REM ── Admin Service
start "SwiftRoute - Admin :4008" cmd /k "cd /d %ROOT%\services\admin-service && npm run dev"

timeout /t 5 /nobreak >nul

REM ── API Gateway (start last — depends on all services)
start "SwiftRoute - Gateway :4000" cmd /k "cd /d %ROOT%\gateway && npm run dev"

echo.
echo [SwiftRoute] All services started!
echo.
echo   Gateway (entry point) : http://localhost:4000
echo   Monolith (SPA)        : http://localhost:3000
echo   Auth Service          : http://localhost:4001
echo   Order Service         : http://localhost:4003
echo   Shipment Service      : http://localhost:4004
echo   Delivery Service      : http://localhost:4005
echo   Payment Service       : http://localhost:4006
echo   Notification Service  : http://localhost:4007
echo   Admin Service         : http://localhost:4008
echo.
echo   Open http://localhost:4000 in your browser.
echo.
pause
