# Setup script for My Health Companion on Windows
Write-Host "🚀 Iniciando setup de My Health Companion..." -ForegroundColor Green

# Verificar si PostgreSQL está instalado
$pgInstalled = Get-Service postgresql* -ErrorAction SilentlyContinue
if (-not $pgInstalled) {
    Write-Host "❌ PostgreSQL no está instalado. Por favor, instala PostgreSQL desde:" -ForegroundColor Red
    Write-Host "https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "Asegúrate de recordar la contraseña que configures para el usuario 'postgres'" -ForegroundColor Yellow
    exit 1
}

# Verificar si el servicio de PostgreSQL está corriendo
$pgService = Get-Service postgresql* | Where-Object {$_.Status -ne 'Running'}
if ($pgService) {
    Write-Host "🔄 Iniciando servicio de PostgreSQL..." -ForegroundColor Yellow
    Start-Service postgresql*
} else {
    Write-Host "✅ Servicio de PostgreSQL está corriendo" -ForegroundColor Green
}

# Crear base de datos y configurar usuario
Write-Host "🗄️ Configurando base de datos..." -ForegroundColor Yellow

# Obtener la ruta de PostgreSQL
$pgPath = (Get-Command psql).Path
$pgBin = Split-Path -Parent $pgPath

# Crear la base de datos
try {
    & "$pgBin\psql" -U postgres -c "CREATE DATABASE health_app;"
    Write-Host "✅ Base de datos creada" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Base de datos ya existe o hubo un error" -ForegroundColor Yellow
}

# Configurar contraseña del usuario postgres
try {
    & "$pgBin\psql" -U postgres -c "ALTER USER postgres WITH PASSWORD '1527';"
    Write-Host "✅ Usuario postgres configurado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error configurando usuario postgres" -ForegroundColor Red
    exit 1
}

# Instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm run install:all

# Poblar la base de datos
Write-Host "📥 Poblando base de datos con datos iniciales..." -ForegroundColor Yellow
npm run setup:db

Write-Host "`n✨ Setup completado! Ahora puedes iniciar la aplicación con:" -ForegroundColor Green
Write-Host "npm run dev" -ForegroundColor Cyan

Write-Host "`n📝 Notas importantes:" -ForegroundColor Yellow
Write-Host "- Asegúrate de que PostgreSQL esté en tu PATH" -ForegroundColor White
Write-Host "- Si tienes problemas con psql, verifica que la ruta de PostgreSQL esté en tus variables de entorno" -ForegroundColor White
Write-Host "- La base de datos está configurada con:" -ForegroundColor White
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Puerto: 5432" -ForegroundColor White
Write-Host "  Base de datos: health_app" -ForegroundColor White
Write-Host "  Usuario: postgres" -ForegroundColor White
Write-Host "  Contraseña: 1527" -ForegroundColor White 