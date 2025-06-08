# My Health Companion

Aplicación de salud y nutrición con sistema de usuarios y perfiles.

## Requisitos Previos

-   Node.js (v14 o superior)
-   Python (v3.8 o superior)
-   pip (gestor de paquetes de Python)

## Instalación

Instalar dependencias:

```bash
# Instalar todas las dependencias (backend y frontend)
npm run install:all
```

## Desarrollo

Para iniciar el servidor de desarrollo (tanto backend como frontend):

```bash
npm run dev
```

Esto iniciará:

-   Backend en http://localhost:8000
-   Frontend en http://localhost:3000

Si van a http://localhost:8000/docs van a ver la una documentacion interactiva de la API.

## Scripts Disponibles

-   `npm run install:all`: Instala todas las dependencias (backend y frontend)
-   `npm run install:backend`: Instala solo las dependencias del backend
-   `npm run install:frontend`: Instala solo las dependencias del frontend
-   `npm run start:backend`: Inicia solo el servidor backend
-   `npm run start:frontend`: Inicia solo el servidor frontend
-   `npm run dev`: Inicia ambos servidores simultáneamente

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

### Nutrient Summary
-   **GET** `/nutrient-summary/daily`: Obtener resumen de macro y micronutrientes del paciente actual para una fecha específica (hoy por defecto)
-   **GET** `/nutrient-summary/{meal_id}`: Obtener resumen de macro y micronutrientes de un plato específico del paciente actual


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
