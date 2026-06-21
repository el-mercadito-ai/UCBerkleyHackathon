@echo off
echo ========================================
echo PUSH AL REPO DE GITHUB
echo ========================================
echo.
echo Repo: https://github.com/pecezon/UCBerkleyHackathon
echo Rama: diego/frontend-marketplace
echo.
cd /d "C:\Users\simular\AppData\Roaming\simular-unified-ui\SimularFiles\UCBerkleyHackathon"
git push -u origin diego/frontend-marketplace
echo.
echo ========================================
if %ERRORLEVEL% EQU 0 (
    echo EXITO! El codigo esta en GitHub
    echo Ver en: https://github.com/pecezon/UCBerkleyHackathon/tree/diego/frontend-marketplace
) else (
    echo ERROR: Necesitas autenticarte con GitHub
    echo.
    echo Si no tienes credenciales configuradas:
    echo 1. Ve a https://github.com/settings/tokens
    echo 2. Genera un Personal Access Token
    echo 3. Usalo como password cuando git te lo pida
)
pause
