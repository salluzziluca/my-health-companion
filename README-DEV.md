# My Health Companion - Guía de Desarrollo

## 🚀 Configuración Rápida

### Opción 1: Script Automático (Recomendado)
```bash
./setup-local.sh
```

### Opción 2: Configuración Manual

1. **Instalar dependencias:**
   ```bash
   npm run install:all
   ```

2. **Levantar base de datos:**
   ```bash
   sudo docker compose up -d db
   ```

3. **Inicializar base de datos:**
   ```bash
   cd backend && ENV=development DATABASE_URL=postgresql://postgres:1527@localhost:5433/health_app python -c "from config.database import create_db_and_tables; create_db_and_tables()" && cd ..
   ```

4. **Insertar datos por defecto:**
   ```bash
   cd backend && ENV=development DATABASE_URL=postgresql://postgres:1527@localhost:5433/health_app python insert_defaults.py && cd ..
   ```

## 🎯 Iniciar Desarrollo

```bash
npm run dev
```

## 🌐 Puertos de la Aplicación

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **Base de datos**: localhost:5433

## 📋 Comandos Útiles

### Desarrollo
```bash
npm run dev              # Iniciar desarrollo completo
npm run start:backend    # Solo backend
npm run start:frontend   # Solo frontend
```

### Base de Datos
```bash
make db-up               # Levantar base de datos
make db-down             # Bajar base de datos
make db-reset            # Resetear base de datos
npm run setup:db         # Configurar base de datos
```

### Dependencias
```bash
npm run install:all      # Instalar todas las dependencias
npm run install:backend  # Solo dependencias del backend
npm run install:frontend # Solo dependencias del frontend
```

## 🔧 Configuración

### Variables de Entorno (Desarrollo)
El archivo `backend/.env` se crea automáticamente con:
```
ENV=development
DATABASE_URL=postgresql://postgres:1527@localhost:5433/health_app
POSTGRES_DB=health_app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=1527
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
```

### Docker Compose
La base de datos PostgreSQL se ejecuta en el puerto **5433** tanto en desarrollo como en producción.

## 🐛 Solución de Problemas

### Puerto 5433 en uso
```bash
sudo lsof -i :5433
sudo kill -9 <PID>
```

### Resetear todo
```bash
make db-reset
./setup-local.sh
```

### Limpiar contenedores
```bash
sudo docker compose down -v
sudo docker system prune -f
```

## 📁 Estructura del Proyecto

```
my-health-companion/
├── backend/           # API FastAPI
├── frontend/          # React App
├── docker-compose.yml # Configuración Docker
├── package.json       # Scripts npm
├── Makefile          # Comandos make
└── setup-local.sh    # Script de configuración
```

## 🔄 Flujo de Desarrollo

1. **Configuración inicial**: `./setup-local.sh`
2. **Desarrollo diario**: `npm run dev`
3. **Cambios en BD**: `make db-reset` si es necesario
4. **Nuevas dependencias**: `npm run install:all`

## 🚀 Producción

Para producción, la aplicación usa las mismas configuraciones pero con `ENV=production` y las variables de entorno del servidor. 