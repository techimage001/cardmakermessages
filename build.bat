@echo off
cd /d "%~dp0"
node tools\build.js
if errorlevel 1 pause
node tools\tests.js
pause
