# Feature: Plantillas de Dietas para Nutricionistas

## Descripción

Este nuevo feature permite a los nutricionistas crear y gestionar plantillas de dietas que pueden reutilizar para diferentes pacientes. Las plantillas ahorran tiempo al crear dietas similares y permiten mantener consistencia en los planes nutricionales.

## Funcionalidades Principales

### 1. Crear Plantillas
- **Desde cero**: Crear una nueva plantilla con un nombre personalizado y agregar comidas una por una
- **Desde dieta existente**: Clonar una dieta semanal ya asignada a un paciente para convertirla en plantilla

### 2. Gestionar Plantillas
- Listar todas las plantillas del nutricionista
- Ver detalles de cada plantilla (nombre, comidas, fecha de creación)
- Agregar comidas a plantillas existentes
- Eliminar plantillas y comidas individuales

### 3. Asignar Plantillas
- Asignar una plantilla a un paciente específico
- Especificar la fecha de inicio de la semana
- El paciente recibe notificación automática (email + app)

## Endpoints del Backend

### Plantillas
- `POST /template-diets` - Crear nueva plantilla
- `GET /template-diets` - Listar plantillas del profesional
- `GET /template-diets/{id}` - Obtener plantilla específica
- `DELETE /template-diets/{id}` - Eliminar plantilla

### Comidas de Plantillas
- `POST /template-diets/{id}/meals` - Agregar comida a plantilla
- `DELETE /template-diets/{id}/meals/{meal_id}` - Eliminar comida de plantilla

### Asignación
- `POST /template-diets/{id}/assign-to-patient` - Asignar plantilla a paciente
- `POST /template-diets/from-weekly/{weekly_diet_id}` - Crear plantilla desde dieta semanal

## Componentes del Frontend

### 1. TemplateDietManager
**Ubicación**: `frontend/src/components/TemplateDietManager.tsx`

Componente principal para gestionar plantillas:
- Lista todas las plantillas del nutricionista
- Permite crear nuevas plantillas
- Permite clonar desde dietas existentes
- Permite asignar plantillas a pacientes
- Permite agregar/eliminar comidas de plantillas

### 2. TemplateDietsPage
**Ubicación**: `frontend/src/components/pages/TemplateDietsPage.tsx`

Página independiente para gestionar plantillas:
- Accesible desde el menú principal
- Contiene el TemplateDietManager
- Proporciona contexto y explicación del feature

### 3. Integración en NutricionistaDashboard
**Ubicación**: `frontend/src/components/pages/NutricionistaDashboard.tsx`

Integración en el dashboard existente:
- Nuevo botón "Plantillas" en la gestión de pacientes
- Permite acceder a plantillas desde la vista de cada paciente
- Mantiene la funcionalidad existente intacta

### 4. Integración en AssignedDiets
**Ubicación**: `frontend/src/components/AssignedDiets.tsx`

Mejora en la vista de dietas asignadas:
- Botón "Asignar Plantilla" cuando no hay dietas
- Botón "Asignar Plantilla" en la barra superior
- Diálogo para seleccionar plantilla y fecha

## Servicios

### templateDiets.ts
**Ubicación**: `frontend/src/services/templateDiets.ts`

Servicio que maneja todas las operaciones con plantillas:
- Interfaces TypeScript para tipos de datos
- Métodos para todas las operaciones CRUD
- Manejo de errores y respuestas

## Navegación

### Rutas
- `/template-diets` - Página principal de plantillas

### Menú Principal
- Botón con icono de plantilla (solo visible para profesionales)
- Accesible desde el menú desplegable del perfil
- Accesible desde el menú móvil

## Flujo de Uso

### 1. Crear Plantilla
1. Ir a "Plantillas de Dietas" desde el menú
2. Hacer clic en "Nueva Plantilla"
3. Ingresar nombre de la plantilla
4. Agregar comidas una por una (alimento, tipo, día)
5. Guardar plantilla

### 2. Clonar desde Dieta Existente
1. Ir a "Plantillas de Dietas"
2. Hacer clic en "Clonar desde Dieta"
3. Seleccionar dieta semanal existente
4. Ingresar nombre para la nueva plantilla
5. La plantilla se crea automáticamente

### 3. Asignar Plantilla
1. Desde la página de plantillas o desde un paciente
2. Seleccionar plantilla a asignar
3. Seleccionar paciente destino
4. Especificar fecha de inicio de semana
5. Confirmar asignación

## Consideraciones Técnicas

### Compatibilidad
- ✅ No rompe funcionalidad existente
- ✅ Mantiene la estructura actual del dashboard
- ✅ Reutiliza componentes existentes (diálogos, formularios)
- ✅ Sigue los patrones de diseño establecidos

### Seguridad
- Solo nutricionistas pueden acceder a plantillas
- Validación de permisos en frontend y backend
- Verificación de propiedad de plantillas

### UX/UI
- Diseño consistente con el resto de la aplicación
- Feedback visual para todas las acciones
- Manejo de estados de carga y error
- Responsive design para móviles

## Próximas Mejoras

1. **Edición de plantillas**: Permitir modificar plantillas existentes
2. **Categorías**: Organizar plantillas por categorías (hipertensión, diabetes, etc.)
3. **Compartir plantillas**: Permitir compartir plantillas entre nutricionistas
4. **Versiones**: Control de versiones de plantillas
5. **Estadísticas**: Métricas de uso de plantillas

## Testing

### Casos de Prueba Recomendados
1. Crear plantilla desde cero
2. Clonar dieta existente
3. Asignar plantilla a paciente
4. Eliminar plantilla
5. Agregar/eliminar comidas de plantilla
6. Validar permisos de acceso
7. Probar en diferentes dispositivos

## Dependencias

### Frontend
- Material-UI (componentes existentes)
- date-fns (formateo de fechas)
- axios (llamadas HTTP)

### Backend
- FastAPI (endpoints existentes)
- SQLModel (modelos de datos)
- Pydantic (validación de datos)

## Archivos Modificados

### Nuevos Archivos
- `frontend/src/services/templateDiets.ts`
- `frontend/src/components/TemplateDietManager.tsx`
- `frontend/src/components/pages/TemplateDietsPage.tsx`
- `TEMPLATE_DIETS_FEATURE.md`

### Archivos Modificados
- `frontend/src/App.tsx` - Nueva ruta
- `frontend/src/components/PrimarySearchAppBar.tsx` - Nuevo botón de navegación
- `frontend/src/components/pages/NutricionistaDashboard.tsx` - Integración
- `frontend/src/components/AssignedDiets.tsx` - Botón de asignación

## Conclusión

Este feature proporciona una herramienta poderosa para los nutricionistas, permitiéndoles optimizar su trabajo y mantener consistencia en sus planes nutricionales. La implementación es robusta, escalable y mantiene la calidad del código existente. 