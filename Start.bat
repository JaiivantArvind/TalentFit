@echo off
setlocal enabledelayedexpansion

REM 1. Set working directory relative to script location
cd /d "%~dp0"

echo ===================================================================
echo             [*] TalentFit AI - Local Development Launcher
echo ===================================================================
echo.

REM 2. Detect Required Runtimes and Tools
echo [1/6] Verifying prerequisites...
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not found on your system PATH.
    echo         Please install Python 3.10+ from https://www.python.org/
    echo         Ensure "Add Python to PATH" is checked during installation.
    echo.
    pause
    exit /b 1
)

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not found on your system PATH.
    echo         Please install Node.js 18+ from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm is not installed or not found on your system PATH.
    echo.
    pause
    exit /b 1
)
echo [OK] Python, Node.js, and npm detected.

REM 3. Local Python Virtual Environment Setup & Validation
echo.
echo [2/6] Verifying Python virtual environment...
set "VENV_DIR=backend\venv"
set "PYTHON_EXE="

if exist "%VENV_DIR%\Scripts\python.exe" (
    set "PYTHON_EXE=%VENV_DIR%\Scripts\python.exe"
    set "PIP_EXE=%VENV_DIR%\Scripts\pip.exe"
    echo [OK] Virtual environment found at %VENV_DIR%.
) else if exist "backend\.venv\Scripts\python.exe" (
    set "VENV_DIR=backend\.venv"
    set "PYTHON_EXE=backend\.venv\Scripts\python.exe"
    set "PIP_EXE=backend\.venv\Scripts\pip.exe"
    echo [OK] Virtual environment found at backend\.venv.
) else (
    echo [INFO] Python virtual environment not found. Initializing backend\venv...
    python -m venv "%VENV_DIR%"
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to create virtual environment in %VENV_DIR%.
        echo         Please check Python installation and permissions.
        pause
        exit /b 1
    )
    set "PYTHON_EXE=%VENV_DIR%\Scripts\python.exe"
    set "PIP_EXE=%VENV_DIR%\Scripts\pip.exe"
    echo [OK] Virtual environment created successfully at %VENV_DIR%.
)

REM 4. Backend Dependencies Verification (Only install if missing)
echo.
echo [3/6] Verifying backend dependencies...
"%PYTHON_EXE%" -c "import flask, flask_cors, pypdf, docx, numpy, sklearn, google.generativeai, dotenv, supabase, jwt, resend" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [INFO] Backend dependencies missing or incomplete. Installing from backend\requirements.txt...
    "%PIP_EXE%" install -r "backend\requirements.txt"
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install backend dependencies via pip.
        pause
        exit /b 1
    )
    echo [OK] Backend dependencies installed successfully.
) else (
    echo [OK] Backend dependencies verified.
)

REM 5. Frontend Dependencies Verification (Only install if missing)
echo.
echo [4/6] Verifying frontend dependencies...
if not exist "Frontend\node_modules\" (
    echo [INFO] Frontend node_modules directory missing. Running npm install...
    pushd Frontend
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] npm install failed in Frontend directory.
        popd
        pause
        exit /b 1
    )
    popd
    echo [OK] Frontend dependencies installed successfully.
) else (
    echo [OK] Frontend dependencies verified - node_modules present.
)

REM 6. Configuration Verification (Without exposing secrets)
echo.
echo [5/6] Verifying configuration files...
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        echo [INFO] Creating backend\.env from template...
        copy "backend\.env.example" "backend\.env" >nul
        echo [NOTICE] backend\.env created with default template.
    ) else (
        echo [WARNING] backend\.env and backend\.env.example not found!
    )
)

if not exist "Frontend\.env" (
    if exist "Frontend\.env.example" (
        echo [INFO] Creating Frontend\.env from template...
        copy "Frontend\.env.example" "Frontend\.env" >nul
        echo [NOTICE] Frontend\.env created with default template.
    ) else (
        echo [WARNING] Frontend\.env and Frontend\.env.example not found!
    )
)

REM Inspect for placeholder credentials without printing secret values
findstr /I /C:"your_gemini_api_key_here" "backend\.env" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [WARNING] GEMINI_API_KEY in backend\.env is set to placeholder value.
    echo           Semantic scoring and AI summaries will run in heuristic fallback mode.
) else (
    echo [OK] backend\.env configured - GEMINI_API_KEY detected.
)

findstr /I /C:"your_supabase_project_url" "Frontend\.env" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [WARNING] VITE_SUPABASE_URL in Frontend\.env is set to placeholder value.
    echo           Authentication and cloud history will run in safe local stub mode.
) else (
    echo [OK] Frontend\.env configured - Supabase credentials detected.
)

REM 7. Check for Duplicate Service Instances & Launch Order
echo.
echo [6/6] Launching application services...

set "BACKEND_RUNNING=0"
set "FRONTEND_RUNNING=0"

netstat -ano | findstr ":5000" | findstr "LISTENING" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    set "BACKEND_RUNNING=1"
    echo [NOTICE] Port 5000 is already in use. TalentFit backend appears to be already running.
)

netstat -ano | findstr ":5173" | findstr "LISTENING" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    set "FRONTEND_RUNNING=1"
    echo [NOTICE] Port 5173 is already in use. TalentFit frontend appears to be already running.
)

REM Launch Backend if not already running
if "!BACKEND_RUNNING!"=="0" (
    echo [INFO] Starting Flask backend on http://127.0.0.1:5000 in dedicated console...
    start "TalentFit Backend Port 5000" cmd /k "cd /d "%~dp0backend" && call "%~dp0%VENV_DIR%\Scripts\activate.bat" && python app.py"
    
    REM Wait for backend service to become ready
    echo [INFO] Waiting for backend API to become ready...
    set /a RETRIES=0
    :WAIT_LOOP
    ping 127.0.0.1 -n 2 >nul
    set /a RETRIES+=1
    
    curl.exe -s -o nul http://127.0.0.1:5000/
    if %ERRORLEVEL% equ 0 (
        echo [OK] Backend service is live and responding at http://127.0.0.1:5000/
        goto BACKEND_READY
    )
    if !RETRIES! geq 15 (
        echo [WARNING] Backend did not respond within 15 seconds. Proceeding to launch frontend...
        goto BACKEND_READY
    )
    goto WAIT_LOOP
) else (
    echo [SKIP] Skipping backend launch as port 5000 is active.
)

:BACKEND_READY

REM Launch Frontend if not already running
if "!FRONTEND_RUNNING!"=="0" (
    echo [INFO] Starting Vite frontend on http://localhost:5173 in dedicated console...
    start "TalentFit Frontend Port 5173" cmd /k "cd /d "%~dp0Frontend" && npm run dev"
    ping 127.0.0.1 -n 3 >nul
) else (
    echo [SKIP] Skipping frontend launch as port 5173 is active.
)

echo.
echo ===================================================================
echo  [*] TalentFit AI Services are Operational:
echo.
echo  - Frontend Web UI:  http://localhost:5173
echo  - Backend API:      http://127.0.0.1:5000
echo  - Backend Health:   http://127.0.0.1:5000/test
echo ===================================================================
echo.
echo Dedicated console windows will remain open to preserve server logs.
echo Press any key to open the TalentFit web application in your default browser...
pause >nul
start http://localhost:5173
