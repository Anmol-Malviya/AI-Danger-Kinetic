@echo off
echo ===================================================
echo             STARTING SHIELDX AI SUITE
echo ===================================================
echo.

echo [1/2] Launching FastAPI Backend (on http://127.0.0.1:8000)...
start "ShieldX Backend" cmd /k "backend\venv\Scripts\python -m backend.main"

echo [2/2] Launching Vite Frontend (on http://localhost:5173)...
start "ShieldX Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo ShieldX AI is booting. Check the spawned terminals.
echo ===================================================
pause
