@echo off
REM Script to start all API servers on Windows
REM Usage: Double-click this file or run: start-all-apis.bat

echo.
echo ========================================
echo   Starting All API Servers (Windows)
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if ports are in use and kill existing processes
echo Checking for existing servers on ports 8787 and 8788...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8787"') do (
    echo Killing process on port 8787 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8788"') do (
    echo Killing process on port 8788 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul

REM Set environment variables
set UPC_API_KEY=4190D3F1E6057DD921DA7E426A79AAF3
set SPOONACULAR_API_KEY=6da1ac7558c34c9d9c314d1172952a6a
set UPC_API_KEY2=6da1ac7558c34c9d9c314d1172952a6a

echo.
echo Setting API keys...
echo   UPC_API_KEY: Set
echo   SPOONACULAR_API_KEY: Set
echo.

REM Start UPC Proxy Server (Port 8787)
echo ========================================
echo Starting UPC Proxy Server on port 8787...
echo ========================================
start "UPC Proxy Server" cmd /k "set UPC_API_KEY=4190D3F1E6057DD921DA7E426A79AAF3 && cd /d %~dp0 && node server/proxy.js"
timeout /t 3 /nobreak >nul

REM Check if server started
netstat -an | findstr ":8787" >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] UPC Proxy Server started on http://localhost:8787
) else (
    echo [ERROR] Failed to start UPC Proxy Server
    echo Check the server window for error messages
)

echo.

REM Start Recipe API Server (Port 8788)
echo ========================================
echo Starting Recipe API Server on port 8788...
echo ========================================
start "Recipe API Server" cmd /k "set SPOONACULAR_API_KEY=6da1ac7558c34c9d9c314d1172952a6a && set UPC_API_KEY2=6da1ac7558c34c9d9c314d1172952a6a && cd /d %~dp0 && node server/RecipeDB.js"
timeout /t 3 /nobreak >nul

REM Check if server started
netstat -an | findstr ":8788" >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Recipe API Server started on http://localhost:8788
) else (
    echo [ERROR] Failed to start Recipe API Server
    echo Check the server window for error messages
)

echo.
echo ========================================
echo   All Servers Started!
echo ========================================
echo.
echo Server Status:
echo   UPC Proxy:    http://localhost:8787
echo   Recipe API:   http://localhost:8788
echo.
echo Two new command windows have opened - keep them open!
echo Close those windows to stop the servers.
echo.
echo To test the APIs, run:
echo   node test-apis.js
echo.
echo Press any key to exit this window (servers will keep running)...
pause >nul

