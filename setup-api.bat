@echo off
REM Setup script for UPC Database API key (Windows)
REM Usage: setup-api.bat

set UPC_API_KEY=4190D3F1E6057DD921DA7E426A79AAF3
echo UPC_API_KEY has been set
echo.
echo To start the proxy server, run:
echo   npm run start:proxy
echo.
echo Or in PowerShell:
echo   $env:UPC_API_KEY="4190D3F1E6057DD921DA7E426A79AAF3"
echo   npm run start:proxy
