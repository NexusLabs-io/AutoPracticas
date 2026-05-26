@echo off
title AutoPracticas - Creando Acceso Directo...
color 0B

cd /d "%~dp0"

echo.
echo  ==================================================
echo    AutoPracticas - Creador de Acceso Directo
echo  ==================================================
echo.
echo  Creando acceso directo en tu Escritorio de Windows...
echo.

set "SCRIPT_PATH=%~dp0INICIAR_SILENCIOSO.vbs"
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\AutoPracticas.lnk"
set "WORK_DIR=%~dp0"
set "ICON_PATH=%SystemRoot%\System32\shell32.dll"
set "ICON_INDEX=156"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); $Shortcut.TargetPath = '%SCRIPT_PATH%'; $Shortcut.WorkingDirectory = '%WORK_DIR%'; $Shortcut.IconLocation = '%ICON_PATH%,%ICON_INDEX%'; $Shortcut.Description = 'Iniciar AutoPracticas de forma silenciosa en segundo plano'; $Shortcut.Save()"

if %errorlevel% equ 0 (
    echo  [EXITO] Se ha creado el acceso directo "AutoPracticas" en tu Escritorio!
    echo         Ya puedes cerrar esta ventana.
    echo.
    echo  [INFO] Para usar la aplicacion en el futuro:
    echo        1. Haz doble clic en el icono "AutoPracticas" de tu Escritorio.
    echo        2. La aplicacion se iniciara en segundo plano de forma invisible
    echo           y abrira tu navegador de forma automatica.
    echo.
) else (
    echo  [ERROR] No se pudo crear el acceso directo de forma automatica.
    echo.
)

pause
