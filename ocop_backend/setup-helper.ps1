$envFile = ".env"
$mongoUri = "MONGODB_URI=mongodb://localhost:27017/ocop_ecommerce"

Write-Host "🔧 MongoDB Setup Helper" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host ""

function Update-EnvFile {
    if (Test-Path $envFile) {
        $content = Get-Content $envFile -Raw

        if ($content -match "^MONGODB_URI=") {
            Write-Host "📝 Updating existing MONGODB_URI in .env file..." -ForegroundColor Yellow
            $content = $content -replace "^MONGODB_URI=.*", $mongoUri
            $content | Set-Content $envFile
            Write-Host "✅ Updated .env file with local MongoDB connection" -ForegroundColor Green
        } else {
            Write-Host "📝 Adding MONGODB_URI to .env file..." -ForegroundColor Yellow
            Add-Content $envFile $mongoUri
            Write-Host "✅ Added local MongoDB connection to .env file" -ForegroundColor Green
        }

        Write-Host ""
        Write-Host "📄 Current .env file:" -ForegroundColor Cyan
        Get-Content $envFile | Where-Object { $_ -like "*MONGODB_URI*" }
    } else {
        Write-Host "❌ .env file not found. Please create it with:" -ForegroundColor Red
        Write-Host $mongoUri -ForegroundColor Yellow
    }
}

# Check if Docker is available
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "🐳 Docker detected. You can use the setup script:" -ForegroundColor Green
        Write-Host "   .\setup-mongodb.bat" -ForegroundColor Yellow
        Write-Host ""
    }
} catch {
    Write-Host "🐳 Docker not detected. You'll need to install MongoDB locally." -ForegroundColor Yellow
    Write-Host ""
}

# Check current MongoDB connection
if (Test-Path $envFile) {
    $currentUri = Select-String -Path $envFile -Pattern "^MONGODB_URI=" | Select-Object -ExpandProperty Line

    if ($currentUri) {
        Write-Host "📍 Current MongoDB URI: $currentUri" -ForegroundColor Cyan

        if ($currentUri -like "*localhost*" -or $currentUri -like "*127.0.0.1*") {
            Write-Host "✅ Already using local MongoDB" -ForegroundColor Green
        } else {
            Write-Host "🌐 Currently using remote MongoDB (Atlas)" -ForegroundColor Yellow
            Write-Host "💡 For development, consider using local MongoDB" -ForegroundColor Blue

            $response = Read-Host "🔄 Switch to local MongoDB? (y/n)"
            if ($response -eq "y" -or $response -eq "Y") {
                Update-EnvFile
            }
        }
    } else {
        Write-Host "📝 No MongoDB URI found in .env file" -ForegroundColor Yellow
        Write-Host "💡 Setting up local MongoDB connection..." -ForegroundColor Blue
        Update-EnvFile
    }
} else {
    Write-Host "📝 No .env file found" -ForegroundColor Yellow
    Write-Host "💡 Creating local MongoDB connection..." -ForegroundColor Blue
    Update-EnvFile
}

Write-Host ""
Write-Host "🚀 Ready to start the server!" -ForegroundColor Green
Write-Host "   Run: npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "🧪 Test the API:" -ForegroundColor Cyan
Write-Host "   curl http://localhost:5000/api/health" -ForegroundColor Yellow
