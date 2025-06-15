#!/bin/bash

echo "Esperando a que PostgreSQL esté listo..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL está listo!"

echo "Creando tablas y poblando datos..."
python -c "from config.database import create_db_and_tables; create_db_and_tables()"
python -c "from insert_defaults import insert_default_data; insert_default_data()"

echo "Base de datos inicializada correctamente!" 