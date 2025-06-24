// src/components/AssignedDiets.tsx
import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton,
  Paper,
  Chip,
  useTheme,
  Divider,
  Collapse,
  ListItemSecondaryAction,
  Avatar,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { format, parseISO, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from '../services/axiosConfig';
import { templateDietsService, TemplateDiet } from '../services/templateDiets';

interface Diet {
  id: number;
  start_date: string;
  end_date: string;
  total_calories: number;
  status: string;
  meals: Array<{
    id: number;
    meal_type: string;
    completed: boolean;
    meal_name: string;
    day_of_week: string;
    meal_of_the_day: string;
  }>;
}

interface DietasAsignadasProps {
  professionalId: string;
  patientId: string;
  onSelectDiet: (dietId: number | null) => void;
  triggerRefresh: boolean;
}

const DietasAsignadas: React.FC<DietasAsignadasProps> = ({
  professionalId,
  patientId,
  onSelectDiet,
  triggerRefresh
}) => {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [expandedDiet, setExpandedDiet] = useState<number | null>(null);
  const [templates, setTemplates] = useState<TemplateDiet[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [detailedMeals, setDetailedMeals] = useState<{[key: number]: any[]}>({});
  const theme = useTheme();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dietToDelete, setDietToDelete] = useState<number | null>(null);
  const [assignTemplateDialogOpen, setAssignTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [selectedWeekStart, setSelectedWeekStart] = useState('');

  useEffect(() => {
    const fetchDiets = async () => {
      try {
        const response = await axios.get(`/weekly-diets/patient/${patientId}`);
        console.log('Respuesta de dietas:', response.data);
        // Transformar los datos al formato esperado por el componente
        const transformedDiets = response.data.map((diet: any) => ({
          id: diet.id,
          start_date: diet.week_start_date,
          end_date: diet.week_start_date, // Se calcula en el frontend
          total_calories: 0, // Se calcula en el backend
          status: 'active',
          meals: [] // Se obtienen en otra llamada
        }));
        setDiets(transformedDiets);

        // Obtener las comidas para cada dieta
        for (const diet of transformedDiets) {
          try {
            const mealsResponse = await axios.get(`/weekly-diets/${diet.id}/meals`);
            const meals = mealsResponse.data.map((meal: any) => ({
              id: meal.id,
              meal_type: meal.meal_of_the_day,
              completed: meal.completed,
              meal_name: meal.meal_name,
              day_of_week: meal.day_of_week,
              meal_of_the_day: meal.meal_of_the_day
            }));
            setDiets(prevDiets => 
              prevDiets.map(d => 
                d.id === diet.id ? { ...d, meals } : d
              )
            );
            // Almacenar las comidas detalladas
            setDetailedMeals(prev => ({
              ...prev,
              [diet.id]: mealsResponse.data
            }));
          } catch (error) {
            console.error(`Error al obtener comidas para la dieta ${diet.id}:`, error);
          }
        }
      } catch (error) {
        console.error('Error al obtener las dietas:', error);
      }
    };

    fetchDiets();
  }, [professionalId, patientId, triggerRefresh]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await templateDietsService.getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Error al obtener plantillas:', error);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get('/professionals/my-patients');
        setPatients(response.data);
      } catch (error) {
        console.error('Error al cargar pacientes:', error);
      }
    };

    fetchPatients();
  }, []);

  const formatDietDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      const endDate = addDays(date, 6);
      return {
        start: format(date, "d 'de' MMMM", { locale: es }),
        end: format(endDate, "d 'de' MMMM", { locale: es }),
        year: format(date, 'yyyy', { locale: es })
      };
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return {
        start: 'Fecha no disponible',
        end: 'Fecha no disponible',
        year: ''
      };
    }
  };

  const handleDietClick = (dietId: number) => {
    if (expandedDiet === dietId) {
      setExpandedDiet(null);
    } else {
      setExpandedDiet(dietId);
    }
  };

  const handleDeleteDiet = async () => {
    if (!dietToDelete) return;
    try {
      await axios.delete(`/weekly-diets/${dietToDelete}`);
      setDiets(diets.filter(diet => diet.id !== dietToDelete));
      setSnackbar({ open: true, message: 'Dieta eliminada correctamente', severity: 'success' });
    } catch (error) {
      console.error('Error al eliminar la dieta:', error);
      setSnackbar({ open: true, message: 'Error al eliminar la dieta', severity: 'error' });
    } finally {
      setDialogOpen(false);
      setDietToDelete(null);
    }
  };

  const handleAssignTemplate = async () => {
    if (!selectedTemplate || !selectedWeekStart) return;
    
    try {
      await templateDietsService.assignToPatient(selectedTemplate, {
        patient_id: parseInt(patientId),
        week_start_date: selectedWeekStart
      });
      setSnackbar({ open: true, message: 'Plantilla asignada exitosamente', severity: 'success' });
      setAssignTemplateDialogOpen(false);
      setSelectedTemplate(null);
      setSelectedWeekStart('');
      // Recargar las dietas
      window.location.reload();
    } catch (error) {
      console.error('Error al asignar plantilla:', error);
      setSnackbar({ open: true, message: 'Error al asignar la plantilla', severity: 'error' });
    }
  };

  const getMealTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'breakfast': 'Desayuno',
      'lunch': 'Almuerzo',
      'dinner': 'Cena',
      'snack': 'Merienda'
    };
    return types[type] || type;
  };

  const getDayLabel = (day: string) => {
    const days: { [key: string]: string } = {
      'lunes': 'Lunes',
      'martes': 'Martes',
      'miércoles': 'Miércoles',
      'jueves': 'Jueves',
      'viernes': 'Viernes',
      'sábado': 'Sábado',
      'domingo': 'Domingo'
    };
    return days[day] || day;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'success',
      'completed': 'info',
      'pending': 'warning'
    };
    return colors[status] || 'default';
  };

  if (diets.length === 0) {
    return (
      <Box sx={{ py: 2 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Este paciente no tiene dietas asignadas. Hacé clic en "Nueva Dieta" para crear una.
        </Alert>
        {templates.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ContentCopyIcon />}
              onClick={() => setAssignTemplateDialogOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Asignar Plantilla
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Dietas asignadas
        </Typography>
        {templates.length > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<ContentCopyIcon />}
            onClick={() => setAssignTemplateDialogOpen(true)}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Asignar Plantilla
          </Button>
        )}
      </Box>
      <List sx={{ py: 0 }}>
        {diets.map((diet, index) => {
          const dates = formatDietDate(diet.start_date);
          const completedMeals = diet.meals.filter(meal => meal.completed).length;
          const totalMeals = diet.meals.length;
          const completionPercentage = totalMeals > 0 ? (completedMeals / totalMeals) * 100 : 0;

          return (
            <React.Fragment key={diet.id}>
              <Paper
                elevation={1}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <ListItem
                  component="div"
                  onClick={() => handleDietClick(diet.id)}
                  sx={{
                    py: 2,
                    px: 2,
                    cursor: 'pointer',
                    backgroundColor: expandedDiet === diet.id ? 
                      theme.palette.primary.light + '20' : 
                      theme.palette.background.paper
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <RestaurantIcon sx={{ color: 'primary.main' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          Dieta de la semana {dates.start} - {dates.end} {dates.year}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`${Math.round(completionPercentage)}% completado`}
                          size="small"
                          color={completionPercentage === 100 ? 'success' : 'primary'}
                          sx={{ borderRadius: 1 }}
                        />
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDietToDelete(diet.id);
                        setDialogOpen(true);
                      }}
                      sx={{ mr: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    {expandedDiet === diet.id ? <ExpandLess /> : <ExpandMore />}
                  </ListItemSecondaryAction>
                </ListItem>
                <Collapse in={expandedDiet === diet.id} timeout="auto" unmountOnExit>
                  <Box sx={{ px: 2, pb: 2 }}>
                    {detailedMeals[diet.id] && detailedMeals[diet.id].length > 0 ? (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}>
                          Comidas de la dieta:
                        </Typography>
                        {['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].map(day => {
                          const dayMeals = detailedMeals[diet.id].filter((meal: any) => meal.day_of_week === day);
                          if (dayMeals.length === 0) return null;
                          
                          return (
                            <Box key={day} sx={{ mb: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                                {getDayLabel(day)}
                              </Typography>
                              <List dense sx={{ py: 0 }}>
                                {dayMeals.map((meal: any, index: number) => (
                                  <ListItem key={meal.id} sx={{ py: 0.5, px: 1 }}>
                                    <ListItemText
                                      primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Typography variant="body2">
                                            {meal.meal_name}
                                          </Typography>
                                          <Chip
                                            size="small"
                                            label={getMealTypeLabel(meal.meal_of_the_day)}
                                            sx={{ 
                                              backgroundColor: theme.palette.primary.light + '40',
                                              color: theme.palette.primary.main,
                                              fontWeight: 'medium',
                                              fontSize: '0.7rem'
                                            }}
                                          />
                                        </Box>
                                      }
                                      secondary={
                                        <Chip
                                          size="small"
                                          label={meal.completed ? 'Completada' : 'Pendiente'}
                                          color={meal.completed ? 'success' : 'warning'}
                                          sx={{ fontSize: '0.7rem' }}
                                        />
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          );
                        })}
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                        No hay comidas asignadas a esta dieta.
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </Paper>
              {index < diets.length - 1 && (
                <Divider variant="inset" component="li" sx={{ my: 0.5 }} />
              )}
            </React.Fragment>
          );
        })}
      </List>

      {/* Diálogo para asignar plantilla */}
      <Dialog open={assignTemplateDialogOpen} onClose={() => setAssignTemplateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Asignar Plantilla de Dieta</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Plantilla</InputLabel>
              <Select
                value={selectedTemplate || ''}
                onChange={(e) => setSelectedTemplate(e.target.value as number)}
                label="Plantilla"
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name} ({template.meals?.length || 0} comidas)
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
          <Button onClick={() => setAssignTemplateDialogOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleAssignTemplate} 
            variant="contained" 
            disabled={!selectedTemplate || !selectedWeekStart}
          >
            Asignar
          </Button>
        </DialogActions>
      </Dialog>

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
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      >
        <DialogTitle>Eliminar dieta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que querés eliminar esta dieta?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteDiet} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DietasAsignadas;
