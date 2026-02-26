@echo off
setlocal EnableExtensions

set "SCOOP_CMD=%USERPROFILE%\scoop\shims\scoop.cmd"
set "JAVA_HOME_TARGET=%USERPROFILE%\scoop\apps\openjdk17\current"

echo [1/5] Checking Scoop...
if not exist "%SCOOP_CMD%" (
  echo Scoop not found. Installing Scoop...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force; iwr -useb get.scoop.sh | iex"
)

if not exist "%SCOOP_CMD%" (
  echo Failed to install Scoop.
  exit /b 1
)

echo [2/5] Ensuring Java bucket exists...
call "%SCOOP_CMD%" bucket add java >nul 2>&1

echo [3/5] Installing OpenJDK 17 (if missing)...
call "%SCOOP_CMD%" install openjdk17
if errorlevel 1 (
  echo OpenJDK install returned an error. Continuing to verify existing installation...
)

echo [4/5] Resetting OpenJDK shim/path...
call "%SCOOP_CMD%" reset openjdk17

echo [5/5] Setting JAVA_HOME user variable...
setx JAVA_HOME "%JAVA_HOME_TARGET%" >nul

set "JAVA_HOME=%JAVA_HOME_TARGET%"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo.
echo Java installation step completed.
java -version
if errorlevel 1 (
  echo Java not available in current shell. Close and reopen terminal, then run java -version.
  exit /b 1
)

echo.
echo Done. Reopen terminal/VS Code to refresh user environment variables.
endlocal
