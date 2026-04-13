# Backend Migration & Run Script
# Run this from PowerShell in the arak-backend\Arak.PLL directory

Write-Host "=== ARAK Backend Setup ===" -ForegroundColor Cyan

# Step 1: Navigate to backend directory
Set-Location $PSScriptRoot\Arak.PLL

# Step 2: Check if dotnet is available
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: .NET SDK not found. Please install .NET 8 SDK first." -ForegroundColor Red
    Write-Host "Download from: https://dotnet.microsoft.com/download/dotnet/8.0" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n[1/4] Restoring packages..." -ForegroundColor Green
dotnet restore

Write-Host "`n[2/4] Building project..." -ForegroundColor Green
dotnet build --no-restore

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERROR: Build failed. Fix the errors above and try again." -ForegroundColor Red
    exit 1
}

Write-Host "`n[3/4] Creating EF Migration..." -ForegroundColor Green
Set-Location ..\Arak.DAL
dotnet ef migrations add BackendFixes_Apr2026 --startup-project ..\Arak.PLL\Arak.PLL.csproj --project Arak.DAL.csproj

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nWARNING: Migration creation failed. If you already have migrations, this is OK." -ForegroundColor Yellow
}

Write-Host "`n[4/4] Applying migrations to database..." -ForegroundColor Green
dotnet ef database update --startup-project ..\Arak.PLL\Arak.PLL.csproj --project Arak.DAL.csproj

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERROR: Database migration failed. Check your SQL Server connection." -ForegroundColor Red
    Write-Host "Connection string: Server=.;Database=ArakDB;Integrated Security=True;TrustServerCertificate=True" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n=== Database Updated Successfully ===" -ForegroundColor Green

# Step 5: Start the server
Write-Host "`nStarting the API server..." -ForegroundColor Cyan
Set-Location ..\Arak.PLL
dotnet run
