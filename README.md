# My Health Companion

A comprehensive health tracking application with meal planning, weight monitoring, and shopping list features.

## Quick Start

### For New Developers (Ubuntu/Debian)

1. **Install PostgreSQL and setup everything:**
   ```bash
   make install-postgres
   make setup
   make dev
   ```

### For Developers with PostgreSQL Already Installed

1. **Quick setup:**
   ```bash
   make quick-start
   make dev
   ```

### For macOS Users

1. **Install PostgreSQL with Homebrew:**
   ```bash
   make setup-mac
   make setup
   make dev
   ```

## Manual Setup

If you prefer to do things manually or the Makefile doesn't work for your system:

### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

### 2. Setup Database

```bash
# Create user (when prompted, set password to '1527')
sudo -u postgres createuser --interactive postgres

# Create database
sudo -u postgres createdb health_app
```

### 3. Install Dependencies

```bash
npm run install:all
```

### 4. Initialize Database

```bash
cd backend
python init_db.py
python insert_defaults.py
```

### 5. Start Development

```bash
npm run dev
```

## Available Make Commands

- `make help` - Show all available commands
- `make install-postgres` - Install PostgreSQL (Ubuntu/Debian)
- `make setup-db` - Create database and user
- `make install-deps` - Install all dependencies
- `make init-db` - Initialize database tables
- `make insert-data` - Insert default data
- `make setup` - Complete setup (everything except PostgreSQL installation)
- `make dev` - Start development environment
- `make prod` - Start production environment
- `make clean` - Clean up temporary files
- `make quick-start` - Quick setup for developers with PostgreSQL already installed
- `make setup-mac` - Setup PostgreSQL on macOS

## Environment Variables

The application uses the following environment variables (defaults shown):

```bash
POSTGRES_DB=health_app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=1527
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
ENV=development
```

## Features

- **Meal Planning**: Create and manage meals with nutritional information
- **Weight Tracking**: Monitor weight changes over time
- **Shopping Lists**: Generate shopping lists based on meal plans
- **Nutritional Analysis**: Track calories, protein, fat, carbs, and vitamins
- **Professional Dashboard**: Healthcare professionals can manage patients
- **Patient Portal**: Patients can track their health metrics

## Tech Stack

- **Backend**: FastAPI, SQLModel, PostgreSQL
- **Frontend**: React, TypeScript, Material-UI
- **Database**: PostgreSQL (production), SQLite (development fallback)

## Troubleshooting

### PostgreSQL Connection Issues

If you get connection errors, make sure:
1. PostgreSQL is running: `sudo systemctl status postgresql`
2. Database exists: `sudo -u postgres psql -l | grep health_app`
3. User has correct permissions

### Port Already in Use

If ports 3000 (frontend) or 8000 (backend) are in use:
```bash
# Kill processes using these ports
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:8000 | xargs kill -9
```

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js (v14 o superior)
- Python 3.8 o superior
- PostgreSQL

### Instalación Automática (Recomendada)

#### En Linux/macOS:
1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/my-health-companion.git
cd my-health-companion
```

2. Ejecuta el script de setup:
```bash
./setup.sh
```

3. Inicia la aplicación:
```bash
npm run dev
```

#### En Windows:
1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/my-health-companion.git
cd my-health-companion
```

2. Ejecuta el script de setup en PowerShell (como administrador):
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
.\setup.ps1
```

3. Inicia la aplicación:
```bash
npm run dev
```

### Instalación Manual

#### En Linux/macOS:
1. Instala PostgreSQL y crea la base de datos:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE DATABASE health_app;"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '1527';"
```

2. Instala las dependencias:
```bash
npm run install:all
```

3. Pobla la base de datos:
```bash
npm run setup:db
```

4. Inicia la aplicación:
```bash
npm run dev
```

#### En Windows:
1. Instala PostgreSQL desde [postgresql.org](https://www.postgresql.org/download/windows/)
2. Abre pgAdmin y crea una nueva base de datos llamada `health_app`
3. Configura la contraseña del usuario `postgres` como `1527`
4. Instala las dependencias:
```bash
npm run install:all
```
5. Pobla la base de datos:
```bash
npm run setup:db
```
6. Inicia la aplicación:
```bash
npm run dev
```

## 📦 Scripts Disponibles

- `npm run dev`: Inicia la aplicación en modo desarrollo
- `npm run start:prod`: Inicia la aplicación en modo producción
- `npm run setup:db`: Pobla la base de datos con datos iniciales
- `npm run install:all`: Instala todas las dependencias

## 🔧 Configuración de la Base de Datos

- **Host**: localhost
- **Puerto**: 5432
- **Base de datos**: health_app
- **Usuario**: postgres
- **Contraseña**: 1527

## 🚀 Despliegue

La aplicación está configurada para ser desplegada en Render. El archivo `render.yaml` contiene la configuración necesaria.

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## Estructura del Proyecto

```
my-health-companion/
├── backend/          # Servidor FastAPI
│   ├── config/       # Configuraciones
│   ├── models/       # Modelos de datos
│   ├── schemas/      # Esquemas de datos
│   ├── routers/      # Rutas de la API
│   └── utils/        # Utilidades
├── frontend/         # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── types/
└── package.json      # Scripts y dependencias del proyecto
```

## Endpoints de la API

### Autenticación

-   **POST** `/register/patient`: Registro de pacientes
-   **POST** `/register/professional`: Registro de profesionales (nutricionistas/entrenadores)
-   **POST** `/token`: Login y obtención de token de acceso

### Pacientes

-   **GET** `/patients/me`: Obtener información del paciente actual
-   **PATCH** `/patients/me`: Actualizar información del paciente
-   **GET** `/patients/my-professional`: Obtener profesional asignado
-   **POST** `/patients/assign-professional/{uuid_code}`: Enlazar al paciente con un profesional mediante un codigo UUID
-   **DELETE** `/patients/unassign-professional`: Desvincular al paciente de su profesional

### Profesionales

-   **GET** `/professionals/me`: Obtener información del profesional actual
-   **PATCH** `/professionals/me`: Actualizar información del profesional
-   **GET** `/professionals/my-patients`: Listar pacientes asignados
-   **GET** `/professionals/patient/{patient_id}`: Ver información de un paciente específico
-   **POST** `/professionals/assign-patient/{patient_id}`: Asignar paciente al profesional
-   **DELETE** `/professionals/unassign-patient/{patient_id}`: Desasignar paciente
-   **GET** `/professionals/me/uuid`: Obtener el UUID del profesional actual

### Weight Logs

-   **POST** `/patients/weight`: Crear registro de peso
-   **GET** `/patients/weight-history`: Obtener historial de peso

### Weekly Summaries

-   **GET** `/patients/weekly-summary`: Obtener resumen semanal actual
-   **GET** `/patients/weekly-summary/history`: Obtener historial de resúmenes semanales

### Weekly Notes

-   **POST** `/patients/weekly-notes`: Crear o actualizar nota semanal
-   **GET** `/patients/weekly-notes/{week_start_date}`: Obtener nota semanal por fecha
-   **DELETE** `/patients/weekly-notes/{week_start_date}`: Eliminar nota semanal

### Meals

-   **GET** `/meals`: Listar platos del paciente actual
-   **POST** `/meals`: Crear un nuevo plato
-   **GET** `/meals/{meal_id}`: Obtener información de un plato específico
-   **PATCH** `/meals/{meal_id}`: Actualizar información de un plato
-   **DELETE** `/meals/{meal_id}`: Eliminar un plato

### Foods

-   **GET** `/foods`: Listar todas las comidas precargadas
-   **GET** `/foods/custom`: Listar comidas personalizadas del paciente actual
-   **POST** `/foods`: Crear una nueva comida personalizada (sin ingredientes)
-   **GET** `/{food_id}/ingredients`: Listar ingredientes (por IDs) de una comida personalizada
-   **POST** `/{food_id}/ingredients`: Agregar ingredientes a una comida personalizada

### Ingredients

-   **GET** `/ingredients`: Listar ingredientes disponibles
-   **GET** `/ingredients/{ingredient_id}`: Obtener información de un ingrediente específico

### Weekly Diets

-   **POST** `/weekly-diets/`: Crear dieta semanal
-   **POST** `/weekly-diets/{weekly_diet_id}/meals`: Agregar plato a dieta semanal
-   **PATCH** `/weekly-diets/{weekly_diet_id}/meals/{meal_id}/complete`: Marcar plato como completado y agregarlo a las comidas del paciente
-   **PATCH** `/weekly-diets/{weekly_diet_id}/meals/{meal_id}/uncomplete`: Desmarcar plato como completado y eliminar de las comidas del paciente
-   **GET** `/weekly-diets/patient/{patient_id}`: Obtener todas las dietas semanales de un paciente
-   **GET** `/weekly-diets/professional/{professional_id}`: Obtener todas las dietas semanales de un profesional
-   **GET** `/weekly-diets/{weekly_diet_id}/meals`: Obtener platos de dieta semanal con estado
-   **DELETE** `/weekly-diets/{weekly_diet_id}/meals/{meal_id}`: Eliminar plato de dieta semanal
-   **DELETE** `/weekly-diets/{weekly_diet_id}`: Eliminar dieta semanal
-   **POST** `/weekly-diets/{weekly_diet_id}/send-diet-email`: Enviar dieta semanal por email al paciente

### Goals

-   **POST** `/goals/`: Crear un nuevo objetivo para un paciente (solo profesionales)
-   **GET** `/goals/patient/{patient_id}`: Obtener objetivos de un paciente (solo profesionales)
-   **GET** `/goals/patient/{patient_id}/progress`: Obtener el progreso de los objetivos activos de un paciente (solo profesionales)
-   **GET** `/goals/my-goals`: Obtener mis objetivos (solo pacientes)
-   **GET** `/goals/my-goals/active`: Obtener mis objetivos activos (solo pacientes)
-   **GET** `/goals/my-goals/progress`: Obtener el progreso de mis objetivos activos (solo pacientes)
-   **PUT** `/goals/{goal_id}`: Actualizar un objetivo (solo profesionales)
-   **DELETE** `/goals/{goal_id}`: Eliminar un objetivo (solo profesionales)
-   **POST** `/goals/{goal_id}/complete`: Marcar un objetivo como completado (solo profesionales)

### Water Intake

-   **POST** `/water/`: Registrar una nueva ingesta de agua (solo pacientes)
-   **GET** `/water/`: Obtener mis ingestas de agua (solo pacientes)
-   **GET** `/water/daily-summary`: Obtener resumen diario de consumo de agua
-   **GET** `/water/weekly-summary`: Obtener resumen semanal de consumo de agua
-   **PUT** `/water/{intake_id}`: Actualizar una ingesta de agua (solo pacientes)
-   **DELETE** `/water/{intake_id}`: Eliminar una ingesta de agua (solo pacientes)
-   **GET** `/water/patient/{patient_id}`: Obtener ingestas de agua de un paciente (solo profesionales asignados)
-   **GET** `/water/patient/{patient_id}/daily-summary`: Obtener resumen diario de agua de un paciente (solo profesionales asignados)

### Water Reminders

-   **POST** `/water/reminders/`: Crear o actualizar configuración de recordatorios de agua
-   **GET** `/water/reminders/`: Obtener mi configuración de recordatorios de agua
-   **PUT** `/water/reminders/`: Actualizar configuración de recordatorios de agua
-   **DELETE** `/water/reminders/`: Eliminar configuración de recordatorios de agua
-   **POST** `/water/reminders/send-now`: Enviar un recordatorio de agua inmediatamente (para pruebas)

### Nutrient Summary

-   **GET** `/nutrient-summary/daily`: Obtener resumen de macro y micronutrientes del paciente actual para una fecha específica (hoy por defecto)
-   **GET** `/nutrient-summary/{meal_id}`: Obtener resumen de macro y micronutrientes de un plato específico del paciente actual

### Shopping Lists

-   **GET** `/shopping-lists/`: Obtener todas las listas de compras del usuario actual (con filtro opcional por estado)
-   **GET** `/shopping-lists/{list_id}`: Obtener una lista de compras específica con todos sus items
-   **POST** `/shopping-lists/`: Crear una nueva lista de compras
-   **PATCH** `/shopping-lists/{list_id}`: Actualizar una lista de compras
-   **DELETE** `/shopping-lists/{list_id}`: Eliminar una lista de compras y todos sus items
-   **PATCH** `/shopping-lists/{list_id}/items/bulk-update`: Marcar múltiples items como comprados/no comprados
-   **POST** `/shopping-lists/{list_id}/items`: Agregar un item manualmente a una lista de compras
-   **PATCH** `/shopping-lists/{list_id}/items/{item_id}`: Actualizar un item de la lista de compras
-   **DELETE** `/shopping-lists/{list_id}/items/{item_id}`: Eliminar un item específico de la lista de compras
-   **POST** `/shopping-lists/{list_id}/items/from-diet`: Generar items en la lista de compras basados en una dieta semanal
-   **GET**`shopping-lists/{list_id}/stats`: Obtener estadísticas de una lista de compras

### Template Diets
-   **POST** `/template-diets`: Crear un nuevo template de dieta
-   **GET** `/template-diets`: Listar todos los templates de dieta del profesional actual
-   **GET** `/template-diets/{template_diet_id}`: Obtener información de un template de dieta específico
-   **POST** `/template-diets/{template_diet_id}/meals`: Agregar una comida a un template de dieta
-   **POST** `/template-diets/{template_diet_id}/assign-to-patient`: Asignar un template de dieta a un paciente
-   **POST** `/template-diets/from-weekly/{weekly_diet_id}`: Crear un template de dieta a partir de una dieta semanal existente

## Notas para Desarrolladores

-   El backend usa SQLite como base de datos
-   El frontend está construido con React + TypeScript
-   Se usa Material-UI para los componentes de la interfaz
-   La autenticación se maneja con JWT tokens
-   El envio de emails se realiza usando la librería `smtplib` de Python

### Documentacion de FastAPI

Para usar los endpoints que requieren autenticación:

Una vez registrado un paciente/ profesional con el endpoint `/register`, haga click en uno de los candados.

![image](https://github.com/user-attachments/assets/fbc55ba3-ae24-4aa6-bd88-427ceb56d294)

Ingrese el email utilizado y la contraseña sin modificar los demás campos.

![image](https://github.com/user-attachments/assets/d7962b0e-1c33-494b-8c7d-82b51cacb5e1)

Cualquier cosa en `backend\routers` están los endpoints.

## Solución de Problemas

### Backend

-   Si hay problemas con las dependencias de Python:
    ```bash
    python -m pip install --upgrade pip
    npm run install:backend
    ```

### Frontend

-   Si hay problemas con las dependencias de Node:
    ```bash
    cd frontend
    npm install
    ```

## Contribución

1. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
2. Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
3. Push a la rama (`git push origin feature/AmazingFeature`)
4. Abrir un Pull Request

5. Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
6. Push a la rama (`git push origin feature/AmazingFeature`)
7. Abrir un Pull Request
