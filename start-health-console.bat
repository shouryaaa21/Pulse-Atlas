@echo off
REM Double-click this file to start both the backend and frontend
REM servers, then automatically open the site in your browser.
REM
REM IMPORTANT: this file must sit in the SAME folder as both the
REM health-backend folder and the medical-console folder, right next
REM to them (not inside either one).

echo Starting backend...
start "Health Console - Backend" cmd /k "cd /d %~dp0health-backend && npm run dev"

echo Starting frontend...
start "Health Console - Frontend" cmd /k "cd /d %~dp0medical-console && npm run dev"

echo Waiting for both servers to warm up...
timeout /t 10 /nobreak > nul

echo Opening the site in your browser...
start http://localhost:3000

echo.
echo Both servers are running in their own windows.
echo Close those two windows when you're done to stop them.
echo This window can be closed now.
pause
