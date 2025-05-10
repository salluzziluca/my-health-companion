# My Health Companion

Aplicación de salud y nutrición con sistema de usuarios y perfiles.

## Requisitos Previos

- Node.js (v14 o superior)
- Python (v3.8 o superior)
- pip (gestor de paquetes de Python)

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
- Backend en http://localhost:8000
- Frontend en http://localhost:3000

si van a http://localhost:8000/docs van a ver la una documentacion interactiva de la API

## Scripts Disponibles

- `npm run install:all`: Instala todas las dependencias (backend y frontend)
- `npm run install:backend`: Instala solo las dependencias del backend
- `npm run install:frontend`: Instala solo las dependencias del frontend
- `npm run start:backend`: Inicia solo el servidor backend
- `npm run start:frontend`: Inicia solo el servidor frontend
- `npm run dev`: Inicia ambos servidores simultáneamente

## Estructura del Proyecto

```
my-health-companion/
├── backend/           # Servidor FastAPI
│   ├── config/       # Configuraciones
│   ├── models/       # Modelos de datos
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
- POST `/register`: Registro de usuarios
- POST `/token`: Login y obtención de token

### Usuarios
- GET `/users/me`: Información del usuario actual
- PATCH `/users/me`: Actualizar información del usuario
- GET `/users/my-users`: Lista de usuarios (solo nutricionistas)

### Perfiles
- GET `/profiles/me`: Perfil del usuario actual
- PATCH `/profiles/me`: Actualizar perfil
- GET `/profiles/user/{user_id}`: Ver perfil de otro usuario

## Notas para Desarrolladores

- El backend usa SQLite como base de datos
- El frontend está construido con React + TypeScript
- Se usa Material-UI para los componentes de la interfaz
- La autenticación se maneja con JWT tokens

## Solución de Problemas

### Backend
- Si hay problemas con las dependencias de Python:
  ```bash
  python -m pip install --upgrade pip
  npm run install:backend
  ```

### Frontend
- Si hay problemas con las dependencias de Node:
  ```bash
  cd frontend
  npm install
  ```

## Contribución

1. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
2. Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
3. Push a la rama (`git push origin feature/AmazingFeature`)
4. Abrir un Pull Request