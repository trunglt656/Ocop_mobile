Write-Host "Starting OCOP Admin API Server..." -ForegroundColor Green
Write-Host "Port: 5000" -ForegroundColor Yellow
Write-Host "Admin Login: admin@ocop.vn / admin123" -ForegroundColor Cyan
Write-Host ""

# Start the Node.js server
node admin-api.js
