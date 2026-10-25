@echo off
setlocal
pushd "%~dp0"
if errorlevel 1 (
  echo [SMAX SELF] Cannot access repository directory.
  exit /b 1
)
echo [SMAX SELF] Developer-only QA. No upload, no deployment, no sale.
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File "%~dp0scripts\VERIFY_SELF_WINDOWS.ps1"
set "QA_EXIT=%ERRORLEVEL%"
echo.
if not "%QA_EXIT%"=="0" (
  echo [SMAX SELF] QA did NOT pass. Check the error. Do not distribute.
) else (
  echo [SMAX SELF] Local Node QA passed. Windows browser testing still required.
)
popd
pause
exit /b %QA_EXIT%
