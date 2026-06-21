@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo  Pushing juan/scaffolding to GitHub
echo ========================================
echo.
git push -u origin juan/scaffolding
echo.
if %errorlevel% equ 0 (
    echo ========================================
    echo SUCCESS! Branch pushed to GitHub
    echo ========================================
    echo.
    echo Next step: Open a PR at:
    echo https://github.com/pecezon/UCBerkleyHackathon/compare/juan/scaffolding
    echo.
) else (
    echo ========================================
    echo FAILED - See error above
    echo ========================================
    echo.
)
pause
