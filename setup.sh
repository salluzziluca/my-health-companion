#!/bin/bash

echo "🚀 Iniciando setup de My Health Companion..."

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "📦 Instalando PostgreSQL..."
    sudo apt update
    sudo apt install postgresql postgresql-contrib -y
else
    echo "✅ PostgreSQL ya está instalado"
fi

# Verificar si el servicio de PostgreSQL está corriendo
if ! sudo systemctl is-active --quiet postgresql; then
    echo "🔄 Iniciando servicio de PostgreSQL..."
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
else
    echo "✅ Servicio de PostgreSQL está corriendo"
fi

# Crear base de datos y configurar usuario
echo "🗄️ Configurando base de datos..."
sudo -u postgres psql -c "CREATE DATABASE health_app;" 2>/dev/null || echo "Base de datos ya existe"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '1527';"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm run install:all

# Poblar la base de datos
echo "📥 Poblando base de datos con datos iniciales..."
npm run setup:db

echo "✨ Setup completado! Ahora puedes iniciar la aplicación con:"
echo "npm run dev" 