#!/bin/bash

# Script de configuración local para My Health Companion
# Configura todo para usar el puerto 5433

echo "🚀 Configurando My Health Companion para desarrollo local..."

# Crear archivo .env en el backend si no existe
if [ ! -f "backend/.env" ]; then
    echo "📝 Creando archivo .env en backend..."
    cat > backend/.env << EOF
# Configuración de desarrollo local
ENV=development
DATABASE_URL=postgresql://postgres:1527@localhost:5433/health_app
POSTGRES_DB=health_app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=1527
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
EOF
    echo "✅ Archivo .env creado"
else
    echo "ℹ️  Archivo .env ya existe"
fi

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker y ejecuta este script nuevamente."
    exit 1
fi

# Levantar la base de datos
echo "🐘 Levantando base de datos PostgreSQL en puerto 5433..."
sudo docker compose up -d db

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 10

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm run install:all

# Inicializar la base de datos
echo "🗄️  Inicializando base de datos..."
cd backend && ENV=development DATABASE_URL=postgresql://postgres:1527@localhost:5433/health_app python -c "from config.database import create_db_and_tables; create_db_and_tables()" && cd ..

# Insertar datos por defecto
echo "📊 Insertando datos por defecto..."
cd backend && ENV=development DATABASE_URL=postgresql://postgres:1527@localhost:5433/health_app python insert_defaults.py && cd ..

echo "✅ Configuración completada!"
echo ""
echo "🎯 Para iniciar el desarrollo:"
echo "   npm run dev"
echo ""
echo "🌐 La aplicación estará disponible en:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   Base de datos: localhost:5433"
echo ""
echo "📋 Comandos útiles:"
echo "   npm run dev          - Iniciar desarrollo"
echo "   make db-up           - Levantar solo la base de datos"
echo "   make db-down         - Bajar la base de datos"
echo "   make db-reset        - Resetear la base de datos" 