@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
echo ==============================================
echo  TalentFit AI - Backend Server
echo ==============================================
echo.
echo Starting Flask application...
echo Service available at: http://127.0.0.1:5000
echo.
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
)
python app.py
pause
