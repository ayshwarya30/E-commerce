@echo off
setlocal EnableExtensions

set "ROOT=%~dp0"
set "DEFAULT_URI=mongodb://localhost:27017/ecommerce"
set "MONGO_URI=%~1"

if "%MONGO_URI%"=="" set "MONGO_URI=%DEFAULT_URI%"

set "MONGOIMPORT=mongoimport"
if exist "%USERPROFILE%\scoop\apps\mongodb\current\bin\mongoimport.exe" (
  set "MONGOIMPORT=%USERPROFILE%\scoop\apps\mongodb\current\bin\mongoimport.exe"
)
if exist "%USERPROFILE%\scoop\apps\mongodb-database-tools\current\bin\mongoimport.exe" (
  set "MONGOIMPORT=%USERPROFILE%\scoop\apps\mongodb-database-tools\current\bin\mongoimport.exe"
)

if /I "%MONGOIMPORT%"=="mongoimport" (
  where mongoimport >nul 2>&1
  if errorlevel 1 (
    echo mongoimport not found.
    echo Install MongoDB Database Tools first. Example:
    echo scoop install mongodb-database-tools
    exit /b 1
  )
) else (
  if not exist "%MONGOIMPORT%" (
    echo mongoimport not found at: %MONGOIMPORT%
    exit /b 1
  )
)

echo Using Mongo URI: %MONGO_URI%
echo Using mongoimport: %MONGOIMPORT%
echo.

call :import products products.json
if errorlevel 1 exit /b 1

call :import cart_items cart_items.json
if errorlevel 1 exit /b 1

call :import wishlist_items wishlist_items.json
if errorlevel 1 exit /b 1

call :import orders orders.json
if errorlevel 1 exit /b 1

echo.
echo Mock data import completed successfully.
exit /b 0

:import
set "COLLECTION=%~1"
set "FILE=%ROOT%mock\%~2"
echo Importing %COLLECTION% from %FILE%
"%MONGOIMPORT%" --uri "%MONGO_URI%" --collection "%COLLECTION%" --drop --jsonArray --file "%FILE%"
if errorlevel 1 (
  echo Failed to import %COLLECTION%.
  exit /b 1
)
exit /b 0
