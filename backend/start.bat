@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
echo Starting Python Flask Backend...
echo.
echo Loading SBERT model (this may take a moment)...
echo Backend will be available at http://127.0.0.1:5000
echo.
python app.py
pause
