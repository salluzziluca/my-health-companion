import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  MenuItem,
  Chip,
  Paper,
  Stack,
  Alert,
  Snackbar,
  Divider,
  useTheme,
  Avatar,
  ListItemAvatar,
  Collapse,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Restaurant as RestaurantIcon,
  ContentCopy as CloneIcon,
  Assignment as AssignIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { templateDietsService, TemplateDiet, TemplateDietMeal } from '../services/templateDiets';
import axios from '../services/axiosConfig';

interface FoodOption {
  id: number;
  food_name: string;
  calories: number;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
}

interface TemplateDietManagerProps {
  onTemplateAssigned?: () => void;
}

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
const mealTypeLabels: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
};

const daysOfWeek = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

const TemplateDietManager: React.FC<TemplateDietManagerProps> = ({ onTemplateAssigned }) => {
  const [templates, setTemplates] = useState<TemplateDiet[]>([]);
  const [foods, setFoods] = useState<FoodOption[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedTemplate, setExpandedTemplate] = useState<number | null>(null);
  const [expandedTemplateMeals, setExpandedTemplateMeals] = useState<number | null>(null);
  
  // Estados para diálogos
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addMealDialogOpen, setAddMealDialogOpen] = useState(false);
  
  // Estados para formularios
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDiet | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [selectedWeekStart, setSelectedWeekStart] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodOption | null>(null);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState('lunes');
  const [selectedWeeklyDiet, setSelectedWeeklyDiet] = useState<number | null>(null);
  const [weeklyDiets, setWeeklyDiets] = useState<any[]>([]);
  
  // Estados para notificaciones
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const theme = useTheme();

  useEffect(() => {
    fetchTemplates();
    fetchFoods();
    fetchPatients();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateDietsService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error al obtener plantillas:', error);
      setSnackbar({ open: true, message: 'Error al cargar las plantillas', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    try {
      const response = await axios.get('/foods');
      setFoods(response.data);
    } catch (error) {
      console.error('Error al cargar alimentos:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/professionals/my-patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    }
  };

  const fetchWeeklyDiets = async () => {
    try {
      const response = await axios.get('/weekly-diets');
      setWeeklyDiets(response.data);
    } catch (error) {
      console.error('Error al cargar dietas semanales:', error);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) return;
    
    try {
      await templateDietsService.createTemplate({ name: newTemplateName.trim() });
      setSnackbar({ open: true, message: 'Plantilla creada exitosamente', severity: 'success' });
      setCreateDialogOpen(false);
      setNewTemplateName('');
      fetchTemplates();
    } catch (error) {
      console.error('Error al crear plantilla:', error);
      setSnackbar({ open: true, message: 'Error al crear la plantilla', severity: 'error' });
    }
  };

  const handleAssignTemplate = async () => {
    if (!selectedTemplate || !selectedPatient || !selectedWeekStart) return;
    
    try {
      await templateDietsService.assignToPatient(selectedTemplate.id, {
        patient_id: parseInt(selectedPatient),
        week_start_date: selectedWeekStart
      });
      setSnackbar({ open: true, message: 'Plantilla asignada exitosamente', severity: 'success' });
      setAssignDialogOpen(false);
      setSelectedTemplate(null);
      setSelectedPatient('');
      setSelectedWeekStart('');
      onTemplateAssigned?.();
    } catch (error) {
      console.error('Error al asignar plantilla:', error);
      setSnackbar({ open: true, message: 'Error al asignar la plantilla', severity: 'error' });
    }
  };

  const handleCloneFromWeeklyDiet = async () => {
    if (!selectedWeeklyDiet || !newTemplateName.trim()) return;
    
    try {
      await templateDietsService.createFromWeeklyDiet(selectedWeeklyDiet, newTemplateName.trim());
      setSnackbar({ open: true, message: 'Plantilla creada desde dieta semanal', severity: 'success' });
      setCloneDialogOpen(false);
      setSelectedWeeklyDiet(null);
      setNewTemplateName('');
      fetchTemplates();
    } catch (error) {
      console.error('Error al clonar dieta:', error);
      setSnackbar({ open: true, message: 'Error al crear plantilla desde dieta', severity: 'error' });
    }
  };

  const handleAddMealToTemplate = async () => {
    if (!selectedTemplate || !selectedFood || !selectedMealType || !selectedDayOfWeek) return;
    
    try {
      await templateDietsService.addMealToTemplate(selectedTemplate.id, {
        meal_name: `${mealTypeLabels[selectedMealType]} ${selectedFood.food_name}`,
        day_of_week: selectedDayOfWeek,
        meal_of_the_day: selectedMealType,
        food_id: selectedFood.id
      });
      setSnackbar({ open: true, message: 'Comida agregada a la plantilla', severity: 'success' });
      setAddMealDialogOpen(false);
      setSelectedFood(null);
      setSelectedMealType('');
      setSelectedDayOfWeek('lunes');
      fetchTemplates();
    } catch (error) {
      console.error('Error al agregar comida:', error);
      setSnackbar({ open: true, message: 'Error al agregar comida a la plantilla', severity: 'error' });
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      await templateDietsService.deleteTemplate(templateId);
      setSnackbar({ open: true, message: 'Plantilla eliminada exitosamente', severity: 'success' });
      fetchTemplates();
    } catch (error) {
      console.error('Error al eliminar plantilla:', error);
      setSnackbar({ open: true, message: 'Error al eliminar la plantilla', severity: 'error' });
    }
  };

  const handleDeleteMeal = async (templateId: number, mealId: number) => {
    try {
      await templateDietsService.deleteMealFromTemplate(templateId, mealId);
      setSnackbar({ open: true, message: 'Comida eliminada de la plantilla', severity: 'success' });
      fetchTemplates();
    } catch (error) {
      console.error('Error al eliminar comida:', error);
      setSnackbar({ open: true, message: 'Error al eliminar la comida', severity: 'error' });
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  const getMealTypeLabel = (type: string) => {
    return mealTypeLabels[type] || type;
  };

  const getDayLabel = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Plantillas de Dietas
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<CloneIcon />}
            onClick={() => {
              fetchWeeklyDiets();
              setCloneDialogOpen(true);
            }}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Clonar desde Dieta
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Nueva Plantilla
          </Button>
        </Stack>
      </Box>

      {templates.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No tienes plantillas de dietas creadas. Crea una nueva plantilla para empezar.
        </Alert>
      ) : (
        <List>
          {templates.map((template) => (
            <Card key={template.id} sx={{ mb: 2, borderRadius: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <ListItemButton
                  onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
                  sx={{ py: 2 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <RestaurantIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {template.name}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={`${template.meals?.length || 0} comidas`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Creada el {formatDate(template.created_at)}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTemplate(template);
                          setAssignDialogOpen(true);
                        }}
                        color="primary"
                        size="small"
                      >
                        <AssignIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTemplate(template);
                          setAddMealDialogOpen(true);
                        }}
                        color="primary"
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                      {expandedTemplate === template.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItemButton>

                <Collapse in={expandedTemplate === template.id}>
                  <Box sx={{ px: 3, pb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Comidas de la Plantilla
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setSelectedTemplate(template);
                          setAddMealDialogOpen(true);
                        }}
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                      >
                        Agregar Comida
                      </Button>
                    </Box>

                    {template.meals && template.meals.length > 0 ? (
                      <List dense>
                        {template.meals.map((meal) => (
                          <ListItem key={meal.id} sx={{ pl: 0 }}>
                            <ListItemText
                              primary={meal.meal_name}
                              secondary={`${getDayLabel(meal.day_of_week)} - ${getMealTypeLabel(meal.meal_of_the_day)}`}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                onClick={() => handleDeleteMeal(template.id, meal.id)}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Esta plantilla no tiene comidas. Agrega comidas para poder usarla.
                      </Alert>
                    )}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          ))}
        </List>
      )}

      {/* Diálogo para crear nueva plantilla */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nueva Plantilla</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la plantilla"
            fullWidth
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            placeholder="Ej: Dieta base para hipertensión"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleCreateTemplate} variant="contained" disabled={!newTemplateName.trim()}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para asignar plantilla */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Asignar Plantilla a Paciente</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Paciente</InputLabel>
              <Select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                label="Paciente"
              >
                {patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              type="date"
              label="Fecha de inicio de la semana"
              fullWidth
              value={selectedWeekStart}
              onChange={(e) => setSelectedWeekStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleAssignTemplate} 
            variant="contained" 
            disabled={!selectedPatient || !selectedWeekStart}
          >
            Asignar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para clonar desde dieta semanal */}
      <Dialog open={cloneDialogOpen} onClose={() => setCloneDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Plantilla desde Dieta Semanal</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre de la plantilla"
              fullWidth
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Ej: Dieta base para hipertensión"
            />
            <FormControl fullWidth>
              <InputLabel>Dieta Semanal</InputLabel>
              <Select
                value={selectedWeeklyDiet || ''}
                onChange={(e) => setSelectedWeeklyDiet(e.target.value as number)}
                label="Dieta Semanal"
              >
                {weeklyDiets.map((diet) => (
                  <MenuItem key={diet.id} value={diet.id}>
                    Dieta del {formatDate(diet.week_start_date)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloneDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleCloneFromWeeklyDiet} 
            variant="contained" 
            disabled={!selectedWeeklyDiet || !newTemplateName.trim()}
          >
            Crear Plantilla
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para agregar comida */}
      <Dialog open={addMealDialogOpen} onClose={() => setAddMealDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Comida a Plantilla</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Autocomplete
              options={foods}
              getOptionLabel={(option) => option.food_name}
              value={selectedFood}
              onChange={(_, newValue) => setSelectedFood(newValue)}
              renderInput={(params) => <TextField {...params} label="Alimento" />}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
            <FormControl fullWidth>
              <InputLabel>Tipo de comida</InputLabel>
              <Select
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value)}
                label="Tipo de comida"
              >
                {mealTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {mealTypeLabels[type]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Día de la semana</InputLabel>
              <Select
                value={selectedDayOfWeek}
                onChange={(e) => setSelectedDayOfWeek(e.target.value)}
                label="Día de la semana"
              >
                {daysOfWeek.map((day) => (
                  <MenuItem key={day} value={day}>
                    {getDayLabel(day)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMealDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleAddMealToTemplate} 
            variant="contained" 
            disabled={!selectedFood || !selectedMealType || !selectedDayOfWeek}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TemplateDietManager; 