if (-not (Test-Path ".env")) {
    Write-Host "No .env file found. Copy .env.example to .env and fill in your values first." -ForegroundColor Red
    exit 1
}

Write-Host "Starting Taskflow..." -ForegroundColor Cyan
docker compose up --build