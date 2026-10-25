@echo off
setlocal
pushd "%~dp0"
if errorlevel 1 (
  echo [SMAX SELF] Cannot access repository directory.
  exit /b 1
)
echo [SMAX SELF] Developer-only QA. No upload, no deployment, no sale.
set "EDGE_ARG="
if /I "%~1"=="/edge" set "EDGE_ARG=-EdgeE2E"
if not "%~1"=="" if not defined EDGE_ARG (
  echo [SMAX SELF] Unknown argument. Use /edge for browser QA, or no argument for Node only.
  popd
  exit /b 2
)
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File "%~dp0scripts\VERIFY_SELF_WINDOWS.ps1" %EDGE_ARG%
set "QA_EXIT=%ERRORLEVEL%"
echo.
if not "%QA_EXIT%"=="0" (
  echo [SMAX SELF] QA did NOT pass. Check the error. Do not distribute.
) else (
  if /I "%~1"=="/edge" (
    echo [SMAX SELF] Edge browser automation passed. Manual Windows QA and release approval still required.
  ) else (
    echo [SMAX SELF] Local Node QA passed. Windows browser testing still required.
  )
)
popd
pause
exit /b %QA_EXIT%
