# PowerShell script to push the juan/scaffolding branch

Set-Location $PSScriptRoot

Write-Host "Pushing juan/scaffolding to GitHub..." -ForegroundColor Cyan
git push -u origin juan/scaffolding

Write-Host ""
Write-Host "✅ Branch pushed!" -ForegroundColor Green
Write-Host "Now open a PR at:"
Write-Host "https://github.com/pecezon/UCBerkleyHackathon/compare/juan/scaffolding" -ForegroundColor Yellow
Write-Host ""
Write-Host "Copy PR_DESCRIPTION.md as the PR body."
