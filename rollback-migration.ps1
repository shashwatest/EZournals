# EZournals Monorepo Rollback Script
# This script reverts the monorepo migration

Write-Host "========================================" -ForegroundColor Red
Write-Host "EZournals Monorepo Rollback Script" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "WARNING: This will undo the monorepo migration!" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Are you sure you want to rollback? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Rollback cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Rolling back migration..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
$isGit = Test-Path ".git"
if ($isGit) {
    Write-Host "Git repository detected. Using git reset..." -ForegroundColor Yellow
    git reset --hard HEAD
    Write-Host "✓ Rollback complete via git" -ForegroundColor Green
} else {
    Write-Host "No git repository found. Manual rollback required." -ForegroundColor Red
    Write-Host "Please restore from backup or re-clone the repository." -ForegroundColor Yellow
}

Write-Host ""
