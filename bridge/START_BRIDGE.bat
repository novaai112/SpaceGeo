@echo off
title SpaceGeo AI - CAD Bridge Server v3.0
echo.
echo  ============================================================
echo   SpaceGeo AI - Local CAD Bridge Server v3.0
echo  ============================================================
echo.
echo  Installing / verifying dependencies...
pip install psutil --quiet 2>nul
pip install pywin32 --quiet 2>nul
pip install pywinauto --quiet 2>nul
echo.
echo  Script execution methods (tried in order):
echo    1. SpaceClaim COM API      -- silent, no UI interaction
echo    2. pywinauto click-only    -- menu navigation, no keyboard
echo    3. /RunScript= launch flag -- used if SpaceClaim is closed
echo.
echo  Starting bridge on port 7800 ...
echo  Keep this window open while using SpaceGeo AI.
echo.
python "%~dp0bridge_server.py"
pause
