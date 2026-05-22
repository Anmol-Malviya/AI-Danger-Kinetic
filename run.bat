@echo off
echo ===================================================
echo             STARTING AI DANGER KINETIC SUITE
echo ===================================================
echo.

echo [1/2] Launching FastAPI Backend (on http://127.0.0.1:8000)...
start "AI Danger Kinetic Backend" cmd /k "backend\venv\Scripts\python -m backend.main"

echo [2/2] Launching Vite Frontend (on http://localhost:5173)...
start "AI Danger Kinetic Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo AI Danger Kinetic is booting. Check the spawned terminals.
echo ===================================================
pause
