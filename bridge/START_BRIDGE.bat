@echo off
title SpaceGeo AI - CAD Bridge Server
echo.
echo  ==========================================
echo   SpaceGeo AI - Local CAD Bridge Server
echo  ==========================================
echo.
echo  Installing dependencies...
pip install psutil --quiet 2>nul
pip install pywin32 --quiet 2>nul
pip install pywinauto --quiet 2>nul
echo.
echo  Starting bridge server on port 7800...
echo  Keep this window open while using SpaceGeo AI.
echo.
python "%~dp0bridge_server.py"
pause
