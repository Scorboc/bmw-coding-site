@echo off
cd /d "%~dp0"
set PORT=5187
node server/index.mjs
if errorlevel 1 pause
