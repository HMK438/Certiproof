@echo off
setlocal
cd /d "%~dp0"

 echo Starting the local Ethereum demo chain...
start "CertiProof Hardhat Chain" cmd /k "cd /d "%~dp0" ^&^& set PATH=C:\Program Files\nodejs;%%PATH%% ^&^& npx hardhat node"
timeout /t 5 /nobreak >nul

 echo Deploying the registry and issuing the sample certificate...
set PATH=C:\Program Files\nodejs;%PATH%
call npm.cmd run compile
if errorlevel 1 goto :failed
call npx.cmd hardhat run scripts/demo-local.ts --network localhost
if errorlevel 1 goto :failed

echo.
echo Starting CertiProof at http://localhost:3000
echo Use the Certificate ID in .demo-certificate.txt on the Verify page.
call npm.cmd run dev
goto :eof

:failed
echo.
echo Demo setup failed. Keep this window open and read the error above.
pause
