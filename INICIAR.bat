@echo off
title AutoPracticas - Iniciando...
color 0A

cd /d "%~dp0"

echo.
echo  ==================================================
echo    AutoPracticas - Lanzador Inteligente
echo  ==================================================
echo.

:: 1. Comprobar si ya hay una instancia corriendo en el puerto 5173
netstat -ano | findstr :5173 >nul
if %errorlevel% equ 0 (
    echo  [INFO] La aplicacion ya se encuentra activa en segundo plano.
    echo         Abriendo tu navegador en http://localhost:5173...
    echo.
    start http://localhost:5173
    exit /b 0
)

:: Verificar si Node.js esta instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js no esta instalado.
    echo  Descargalo en: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Instalar dependencias solo si node_modules no existe
if not exist "node_modules\" (
    echo  [1/2] Instalando dependencias por primera vez...
    echo        ^(esto solo ocurre una vez^)
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo.
        echo  [ERROR] Fallo la instalacion de dependencias.
        pause
        exit /b 1
    )
    echo.
) else (
    echo  [1/2] Dependencias ya instaladas. Continuando...
    echo.
)

echo  [2/2] Iniciando la aplicacion...
echo        El navegador se abrira automaticamente en http://localhost:5173
echo.
echo  Para cerrar la app, presiona Ctrl+C en esta ventana.
echo.

npm run dev
