import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Restaurant as RestaurantIcon, Person as PersonIcon, Delete as DeleteIcon, TrendingUp as TrendingUpIcon, Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { healthService, professionalService } from '../../services/api';
import { WeightLog, WeeklySummary, WeeklyNote } from '../../types/health';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ReferenceLine } from 'recharts';
import { jwtDecode } from 'jwt-decode';
import { useTheme } from '@mui/material/styles';
import { goalsService, GoalProgress } from '../../services/goals';
import WaterDashboard from '../WaterDashboard';
import { format, subWeeks, addWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

interface JwtPayload {
  sub: string;
  user_type?: string;
  type?: string;
  role?: string;
  exp: number;
  [key: string]: any;
}

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

// Objetivos simulados (esto vendría del backend en el futuro)
const GOALS = {
  targetWeight: 75, // Peso objetivo en kg
  weightTolerance: 0.5 // Tolerancia en kg para considerar que se alcanzó el objetivo
};

// Traducción de etiquetas de comidas
const mealLabelsES: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [weight, setWeight] = useState('');
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [weeklyNote, setWeeklyNote] = useState('');
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weightError, setWeightError] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([]);
  const [openNutritionSummary, setOpenNutritionSummary] = useState(false);
  const [nutritionSummary, setNutritionSummary] = useState<any>(null);
  const [loadingNutrition, setLoadingNutrition] = useState(false);
  const theme = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<number>(0); // Un solo estado para ambos gráficos

  // Función para obtener el tipo de usuario del token
  const getUserTypeFromToken = (): string | null => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.user_type || decoded.type || decoded.role || null;
    } catch (error) {
      console.error('Error decodificando el token:', error);
      return null;
    }
  };

  const fetchGoalProgress = async () => {
    try {
      const progress = await goalsService.getMyGoalsProgress();
      setGoalProgress(progress);
    } catch (err) {
      console.error('Error fetching goal progress:', err);
      // No establecer error aquí porque las metas son opcionales
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const patientsList = await professionalService.getMyPatients();
      setPatients(patientsList);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Error al cargar la lista de pacientes');
    } finally {
      setLoading(false);
    }
  };

  // Función para ajustar la fecha a la zona horaria local
  const adjustDateToLocal = (dateString: string) => {
    const date = new Date(dateString);
    // Ajustar la fecha para que sea medianoche en la zona horaria local
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Función para obtener el rango de fechas basado en el período seleccionado
  const getDateRange = (periodOffset: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = startOfWeek(addWeeks(today, periodOffset), { weekStartsOn: 1 });
    const endDate = endOfWeek(addWeeks(today, periodOffset), { weekStartsOn: 1 });
    
    return {
      start: format(startDate, 'yyyy-MM-dd'),
      end: format(endDate, 'yyyy-MM-dd'),
      displayStart: format(startDate, "d 'de' MMMM", { locale: es }),
      displayEnd: format(endDate, "d 'de' MMMM 'de' yyyy", { locale: es })
    };
  };

  // Función para filtrar datos según el período seleccionado
  const filterDataByPeriod = (data: any[], periodOffset: number) => {
    if (!data) return [];
    const { start, end } = getDateRange(periodOffset);
    return data.filter(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0); // Normalizar la hora a 00:00:00
      const startDate = new Date(start);
      const endDate = new Date(end);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  // Función para obtener opciones de período
  const getPeriodOptions = () => {
    const options = [];
    for (let i = -4; i <= 0; i++) {
      const { displayStart, displayEnd } = getDateRange(i);
      options.push({
        value: i,
        label: i === 0 ? 'Esta semana' : `${displayStart} - ${displayEnd}`
      });
    }
    return options;
  };

  const fetchWeeklySummary = async (periodOffset: number = 0) => {
    try {
      const { start, end } = getDateRange(periodOffset);
      console.log('Fetching weekly summary for period:', { start, end });
      const summary = await healthService.getWeeklySummary(start, end);
      console.log('Received weekly summary:', summary);
      console.log('Daily breakdown:', summary.calorie_data.daily_breakdown);
      setWeeklySummary(summary);
      if (summary.notes) {
        setWeeklyNote(summary.notes);
      }
    } catch (err) {
      setError('Error al cargar el resumen semanal');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNutritionSummary = async () => {
    try {
      setLoadingNutrition(true);
      const response = await healthService.getNutrientSummary();
      console.log('Nutrition Summary Response:', response);
      setNutritionSummary(response);
    } catch (error) {
      console.error('Error fetching nutrition summary:', error);
    } finally {
      setLoadingNutrition(false);
    }
  };

  useEffect(() => {
    const role = getUserTypeFromToken();
    setUserRole(role);

    if (role === 'professional') {
      fetchPatients();
    } else {
      fetchWeeklySummary();
      fetchGoalProgress();
    }
  }, []);

  useEffect(() => {
    if (openNutritionSummary) {
      fetchNutritionSummary();
    }
  }, [openNutritionSummary]);

  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWeightError(null);
    if (!weight) return;

    try {
      const newWeight = parseFloat(weight);

      // Registrar el nuevo peso
      await healthService.logWeight(newWeight);

      // Actualizar el perfil con el nuevo peso
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/patients/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          weight: newWeight
        }),
      });

      setWeight('');
      fetchWeeklySummary(); // Refresh the summary
      fetchGoalProgress(); // Refresh goal progress
    } catch (error) {
      console.error('Error al registrar peso:', error);
      setWeightError('Error al registrar el peso');
    }
  };

  const handleNoteSubmit = async () => {
    if (!weeklySummary) return;

    try {
      await healthService.createOrUpdateWeeklyNote({
        week_start_date: weeklySummary.week_start_date,
        notes: weeklyNote,
      });
      setIsNoteDialogOpen(false);
      fetchWeeklySummary(); // Refresh the summary
    } catch (err) {
      setError('Error al guardar la nota');
      console.error(err);
    }
  };

  const handleDeletePatient = async (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const confirmDeletePatient = async () => {
    if (!patientToDelete) return;

    try {
      await professionalService.unassignPatient(patientToDelete.id);
      setPatients(patients.filter(p => p.id !== patientToDelete.id));
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
    } catch (err) {
      console.error('Error al eliminar paciente:', err);
      setError('Error al eliminar el paciente');
    }
  };

  // Función para calcular el porcentaje de progreso hacia una meta de peso
  const calculateWeightProgress = (goalProgress: GoalProgress): number => {
    if (!goalProgress.goal.target_weight || !goalProgress.current_weight) return 0;

    // weight_progress_difference = current_weight - target_weight
    // Si es positivo: está por encima del objetivo
    // Si es negativo: está por debajo del objetivo

    // Para calcular el progreso necesitamos conocer el peso inicial
    // Sin el peso inicial, no podemos calcular un porcentaje de progreso real
    // Por ahora, usaremos un enfoque simplificado basado en qué tan cerca está del objetivo

    if (goalProgress.weight_progress_difference !== null && goalProgress.weight_progress_difference !== undefined) {
      const targetWeight = goalProgress.goal.target_weight;
      const currentWeight = goalProgress.current_weight;
      const difference = Math.abs(goalProgress.weight_progress_difference);

      // Si la diferencia es muy pequeña (dentro de 0.5kg), consideramos que está cerca del 100%
      if (difference <= 0.5) {
        return 100;
      }

      // Sin conocer el peso inicial, no podemos calcular un progreso real
      // Retornamos 0 para evitar mostrar porcentajes incorrectos
      return 0;
    }

    return 0;
  };

  // Función para calcular el porcentaje de progreso hacia una meta de calorías
  const calculateCalorieProgress = (goalProgress: GoalProgress): number => {
    if (!goalProgress.goal.target_calories || !goalProgress.current_daily_calories) return 0;

    const progress = (goalProgress.current_daily_calories / goalProgress.goal.target_calories) * 100;
    return Math.round(Math.min(progress, 150)); // Limitamos a 150% para no mostrar valores extremos
  };

  const calculateWaterProgress = (goalProgress: GoalProgress): number => {
    if (!goalProgress.goal.target_milliliters || !goalProgress.current_daily_water) return 0;

    const progress = (goalProgress.current_daily_water / goalProgress.goal.target_milliliters) * 100;
    return Math.round(Math.min(progress, 150)); // Limitamos a 150% para no mostrar valores extremos
  };

  // Función para obtener el color del progreso
  const getProgressColor = (progress: number, isCompleted: boolean = false) => {
    if (isCompleted) return 'success';
    if (progress >= 90) return 'success';
    if (progress >= 70) return 'warning';
    if (progress >= 40) return 'info';
    return 'default';
  };

  // Obtener metas activas para los gráficos
  const weightGoals = goalProgress.filter(g =>
    g.goal.goal_type === 'weight'
  );
  const calorieGoals = goalProgress.filter(g =>
    g.goal.goal_type === 'calories'
  );
  const waterGoals = goalProgress.filter(g =>
    g.goal.goal_type === 'water'
  );

  // Modificar el manejador para que actualice ambos gráficos
  const handlePeriodChange = (event: any) => {
    const newPeriod = event.target.value;
    setSelectedPeriod(newPeriod);
    fetchWeeklySummary(newPeriod);
  };

  const handleMealsChange = () => {
    fetchWeeklySummary(selectedPeriod);
    if (openNutritionSummary) {
      fetchNutritionSummary();
    }
  };

  // Función para procesar los datos del gráfico
  const processChartData = (data: any[] | undefined) => {
    if (!data) return [];
    
    // Agrupar las comidas por día
    const mealsByDay = data.reduce((acc: { [key: string]: number }, item) => {
      // La fecha ya viene en formato YYYY-MM-DD, no necesitamos convertirla
      const dayKey = item.date;
      // Sumar las calorías para ese día
      acc[dayKey] = (acc[dayKey] || 0) + item.calories;
      return acc;
    }, {});

    // Convertir el objeto a array y ordenar por fecha
    return Object.entries(mealsByDay)
      .map(([date, calories]) => ({
        date,
        calories
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, mx: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (userRole === 'professional') {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Mis Pacientes
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<RestaurantIcon />}
          onClick={() => navigate('/nutricionista')}
          sx={{ mt: 2, mb: 3 }}
        >
          Gestionar Dietas de Pacientes
        </Button>

        {patients.length === 0 ? (
          <Alert severity="info">
            No tienes pacientes asignados. Comparte tu código de vinculación con tus pacientes para que puedan unirse.
          </Alert>
        ) : (
          <List>
            {patients.map((patient) => (
              <Card key={patient.id} sx={{ mb: 2 }}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${patient.first_name} ${patient.last_name}`}
                    secondary={patient.email}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/patient/${patient.id}`)}
                    sx={{ mr: 1 }}
                  >
                    Ver Detalles
                  </Button>
                  <IconButton
                    color="error"
                    onClick={() => handleDeletePatient(patient)}
                    sx={{ '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.04)' } }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              </Card>
            ))}
          </List>
        )}

        {/* Diálogo de confirmación para eliminar paciente */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro que deseas eliminar a {patientToDelete?.first_name} {patientToDelete?.last_name} de tu lista de pacientes?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button onClick={confirmDeletePatient} color="error" variant="contained">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  if (!weeklySummary) {
    return (
      <Box sx={{ mt: 4, mx: 2 }}>
        <Alert severity="info">No hay datos disponibles para mostrar</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 1200, mx: 'auto', width: '100%' }}>
      {/* Header: Registro de peso y periodo */}
      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 3, background: `linear-gradient(90deg, ${theme.palette.primary.light}10 0%, ${theme.palette.secondary.light}10 100%)`, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '-1px', mb: 0.5 }}>
              Mi semana
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 400 }}>
              {weeklySummary.week_start_date} - {weeklySummary.week_end_date}
            </Typography>
          </Box>
          <Box sx={{ width: { xs: '100%', md: 320 } }}>
            <form onSubmit={handleWeightSubmit}>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  label="Nuevo peso"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  error={!!weightError}
                  helperText={weightError}
                  size="small"
                  sx={{ flex: 1, background: 'white', borderRadius: 2 }}
                  InputProps={{
                    endAdornment: <Typography variant="body2" color="text.secondary">kg</Typography>
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    px: 4,
                    py: 1.2,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: 'none',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 2, transform: 'translateY(-2px)' }
                  }}
                >
                  Guardar
                </Button>
              </Stack>
            </form>
          </Box>
        </Stack>
      </Paper>

      {/* Filtro de período */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Ver datos de:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 280 }}>
            <Select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.divider,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              {getPeriodOptions().map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* Progreso de peso (arriba, ancho completo) */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '-0.5px', mb: 2 }}>
          Progreso de Peso
        </Typography>
        <Box sx={{ height: 280, position: 'relative' }}>
          {weeklySummary?.weight_data?.weight_logs?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklySummary.weight_data.weight_logs}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme.palette.divider}
                  vertical={false}
                  opacity={0.5}
                />
                <XAxis
                  dataKey="date"
                  stroke={theme.palette.text.secondary}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: theme.palette.divider }}
                  tickFormatter={(value) => format(new Date(value), 'EEE d', { locale: es })}
                />
                <YAxis
                  stroke={theme.palette.text.secondary}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: theme.palette.divider }}
                  domain={(() => {
                    const weights = weeklySummary.weight_data.weight_logs.map(log => log.weight);
                    const targetWeights = weightGoals
                      .map(goal => goal.goal.target_weight)
                      .filter(weight => weight !== null && weight !== undefined) as number[];
                    const allWeights = [...weights, ...targetWeights];
                    if (allWeights.length === 0) return ['auto', 'auto'];
                    const minWeight = Math.min(...allWeights);
                    const maxWeight = Math.max(...allWeights);
                    const margin = (maxWeight - minWeight) * 0.1 || 5;
                    return [
                      Math.max(0, minWeight - margin),
                      maxWeight + margin
                    ];
                  })()}
                />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    borderRadius: 8,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)} kg`, 'Peso']}
                  labelFormatter={(label) => format(new Date(label), "EEEE d 'de' MMMM", { locale: es })}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: theme.palette.primary.main,
                    stroke: 'white',
                    strokeWidth: 2,
                    opacity: 0.8
                  }}
                  activeDot={{
                    r: 6,
                    fill: theme.palette.primary.main,
                    stroke: 'white',
                    strokeWidth: 2,
                    filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.2))'
                  }}
                  isAnimationActive
                />
                {weightGoals.map((goalProgress) => (
                  goalProgress.goal.target_weight && (
                    <ReferenceLine
                      key={`weight-goal-${goalProgress.goal.id}`}
                      y={goalProgress.goal.target_weight}
                      stroke={theme.palette.success.main}
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{
                        value: `Meta: ${goalProgress.goal.target_weight}kg`,
                        position: "top",
                        fill: theme.palette.success.main,
                        fontSize: 12
                      }}
                    />
                  )
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2
            }}>
              <Typography variant="h6" color="text.secondary">
                No hay registros de peso esta semana
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ingresa tu peso usando el formulario arriba
              </Typography>
            </Box>
          )}
        </Box>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }} flexWrap="wrap">
          <Chip
            label={weeklySummary.weight_data.weight_logs.length > 0 
              ? `Cambio: ${weeklySummary.weight_data.weight_change} kg`
              : 'No hay registros de peso esta semana'}
            color={weeklySummary.weight_data.weight_logs.length > 0 
              ? (weeklySummary.weight_data.weight_change >= 0 ? 'success' : 'error')
              : 'default'}
            size="small"
            sx={{
              borderRadius: 1,
              fontWeight: 600,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          />
          {weightGoals.map((goalProgress) => {
            const progress = calculateWeightProgress(goalProgress);
            const difference = goalProgress.weight_progress_difference;
            return goalProgress.goal.target_weight && (
              <Chip
                key={`weight-goal-chip-${goalProgress.goal.id}`}
                label={
                  goalProgress.is_weight_achieved
                    ? `✓ Meta alcanzada`
                    : difference !== null && difference !== undefined
                      ? Math.abs(difference) <= 0.5
                        ? `Meta: ${goalProgress.goal.target_weight}kg (casi alcanzada)`
                        : `Meta: ${goalProgress.goal.target_weight}kg (faltan ${Math.abs(difference).toFixed(1)}kg)`
                      : `Meta: ${goalProgress.goal.target_weight}kg`
                }
                color={
                  goalProgress.is_weight_achieved
                    ? 'success'
                    : difference !== null && difference !== undefined && Math.abs(difference) <= 0.5
                      ? 'warning'
                      : 'default'
                }
                size="small"
                sx={{
                  borderRadius: 1,
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              />
            );
          })}
        </Stack>
      </Paper>

      {/* Gráfico de Calorías Diarias */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', minHeight: 340, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '-0.5px', mb: 2 }}>
          Calorías Diarias
        </Typography>
        <Box sx={{ height: 280, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processChartData(weeklySummary?.calorie_data?.daily_breakdown)}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.palette.divider}
                vertical={false}
                opacity={0.5}
              />
              <XAxis
                dataKey="date"
                stroke={theme.palette.text.secondary}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: theme.palette.divider }}
                tickFormatter={(value) => {
                  // Crear la fecha usando el formato YYYY-MM-DD directamente
                  const [year, month, day] = value.split('-').map(Number);
                  const date = new Date(year, month - 1, day);
                  return format(date, 'EEE d', { locale: es });
                }}
              />
              <YAxis
                stroke={theme.palette.text.secondary}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: theme.palette.divider }}
                tickFormatter={(value) => `${value.toLocaleString()} cal`}
              />
              <Tooltip
                contentStyle={{
                  background: 'white',
                  borderRadius: 8,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                formatter={(value: number) => [`${value.toLocaleString()} cal`, 'Calorías']}
                labelFormatter={(label) => {
                  // Crear la fecha usando el formato YYYY-MM-DD directamente
                  const [year, month, day] = label.split('-').map(Number);
                  const date = new Date(year, month - 1, day);
                  return format(date, "EEEE d 'de' MMMM", { locale: es });
                }}
              />
              <Bar
                dataKey="calories"
                fill="url(#calorieGradient)"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
                animationDuration={1500}
              />
              {calorieGoals.map((goalProgress) => (
                goalProgress.goal.target_calories && (
                  <ReferenceLine
                    key={`calorie-goal-${goalProgress.goal.id}`}
                    y={goalProgress.goal.target_calories}
                    stroke={theme.palette.warning.main}
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{
                      value: `Meta: ${goalProgress.goal.target_calories.toLocaleString()} cal`,
                      position: "top",
                      fill: theme.palette.warning.main,
                      fontSize: 12
                    }}
                  />
                )
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }} flexWrap="wrap">
          {weeklySummary?.calorie_data?.average_daily_calories && (
            <Chip
              label={`Promedio: ${weeklySummary.calorie_data.average_daily_calories.toFixed(0)} cal/día`}
              color="primary"
              size="small"
              sx={{
                borderRadius: 1,
                fontWeight: 600,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            />
          )}
          {calorieGoals.map((goalProgress) => {
            const progress = calculateCalorieProgress(goalProgress);
            return goalProgress.goal.target_calories && (
              <Chip
                key={`calorie-goal-chip-${goalProgress.goal.id}`}
                label={
                  goalProgress.is_calories_achieved
                    ? `✓ Meta alcanzada (${progress}%)`
                    : progress > 0
                      ? `Meta: ${goalProgress.goal.target_calories.toLocaleString()} cal (${progress}%)`
                      : `Meta: ${goalProgress.goal.target_calories.toLocaleString()} cal`
                }
                color={getProgressColor(progress, goalProgress.is_calories_achieved || false) as any}
                size="small"
                sx={{
                  borderRadius: 1,
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              />
            );
          })}
          {(!weeklySummary?.calorie_data?.daily_breakdown || weeklySummary.calorie_data.daily_breakdown.length === 0) && (
            <Alert severity="info" sx={{ mt: 2, width: '100%' }}>
              Registra comidas para ver tu progreso de calorías.
            </Alert>
          )}
        </Stack>
      </Paper>

      {/* Segunda fila: Resumen de Calorías | Distribución de Comidas (misma altura) */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={3} sx={{ alignItems: 'stretch' }}>
        <Box sx={{ flex: 1, display: 'flex' }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', minHeight: 260, height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>Resumen de Calorías</Typography>
            <Stack spacing={1}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700, letterSpacing: '-1px' }}>{weeklySummary.calorie_data.total_calories.toFixed(0)}</Typography>
              <Typography variant="body2" color="text.secondary">calorías totales</Typography>
              <Divider />
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Promedio diario
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  {Math.round(weeklySummary.calorie_data.average_daily_calories)} kcal
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setOpenNutritionSummary(true)}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    px: 2,
                    boxShadow: 'none',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 2, transform: 'translateY(-2px)' }
                  }}
                >
                  Resumen Nutricional
                </Button>
              </Stack>
              <Typography variant="body2" color="text.secondary">{weeklySummary.calorie_data.days_logged} días registrados</Typography>
              {/* Agregar información de metas en el resumen */}
              {calorieGoals.length > 0 && (
                <>
                  <Divider />
                  {calorieGoals.map((goalProgress) => {
                    const progress = calculateCalorieProgress(goalProgress);
                    return goalProgress.goal.target_calories && (
                      <Box key={`calorie-summary-goal-${goalProgress.goal.id}`}>
                        <Typography variant="body2" color="text.secondary">
                          Meta: {goalProgress.goal.target_calories} cal/día
                        </Typography>
                        {goalProgress.current_daily_calories && (
                          <Typography variant="body2" color={goalProgress.is_calories_achieved ? 'success.main' : 'warning.main'}>
                            {goalProgress.is_calories_achieved ? '✓' : '•'} Diferencia: {goalProgress.calories_progress_difference !== null && goalProgress.calories_progress_difference !== undefined ?
                              `${goalProgress.calories_progress_difference > 0 ? '+' : ''}${goalProgress.calories_progress_difference} cal` :
                              'No disponible'}
                          </Typography>
                        )}
                        {progress > 0 && (
                          <Typography variant="body2" sx={{ fontWeight: 600, color: getProgressColor(progress, goalProgress.is_calories_achieved || false) === 'success' ? 'success.main' : 'warning.main' }}>
                            Progreso: {progress}%
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </>
              )}
            </Stack>
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<RestaurantIcon />}
                  onClick={() => navigate('/weekly-diet')}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    boxShadow: 'none',
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 2, transform: 'translateY(-2px)' }
                  }}
                >
                  Gestionar Dietas
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/meals?add=true')}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: theme.palette.primary.light + '10',
                      borderColor: theme.palette.primary.dark
                    }
                  }}
                >
                  Gestionar Comidas
                </Button>
              </Stack>
              <Button
                variant="contained"
                startIcon={<TrendingUpIcon />}
                onClick={() => navigate('/goals')}
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: 'none',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: 2, transform: 'translateY(-2px)' }
                }}
              >
                Gestionar Objetivos Asignados
              </Button>
            </Stack>
          </Paper>
        </Box>
        <Box sx={{ flex: 1, display: 'flex' }}>
          <WaterDashboard
            waterGoals={waterGoals}
            onWaterAdded={fetchGoalProgress}
          />
        </Box>
      </Stack>

      {/* Tercera fila: Comidas Favoritas | Horario de Comidas | Nota Semanal (misma altura) */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'stretch' }}>
        <Box sx={{ flex: 1, display: 'flex' }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', minHeight: 200, height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>Comidas Favoritas</Typography>
            <Stack spacing={1} sx={{ flex: 0 }}>
              {weeklySummary.meal_trends.favorite_foods.map((food, index) => (
                <Chip key={index} label={food} color={index === 0 ? 'primary' : 'default'} variant={index === 0 ? 'filled' : 'outlined'} sx={{ fontWeight: index === 0 ? 700 : 400, fontSize: '1rem', borderRadius: 2, px: 2 }} />
              ))}
            </Stack>
          </Paper>
        </Box>
        <Box sx={{ flex: 1, display: 'flex' }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', minHeight: 200, height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>Horario de Comidas</Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Hora más frecuente</Typography>
                <Typography variant="h6" sx={{ mt: 0.5 }}>{weeklySummary.meal_trends.most_frequent_meal_time || 'No disponible'}</Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Total de comidas registradas</Typography>
                <Typography variant="h6" sx={{ mt: 0.5 }}>{weeklySummary.meal_trends.total_meals}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>
        <Box sx={{ flex: 1, display: 'flex' }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', minHeight: 200, height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>Nota semanal</Typography>
              <IconButton onClick={() => setIsNoteDialogOpen(true)} size="small" sx={{ color: 'primary.main', transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', color: 'white' } }}>
                <EditIcon />
              </IconButton>
            </Stack>
            <Typography variant="body2" sx={{ color: weeklySummary.notes ? 'text.primary' : 'text.secondary', fontStyle: weeklySummary.notes ? 'normal' : 'italic', mt: 1 }}>
              {weeklySummary.notes || 'No hay notas para esta semana'}
            </Typography>
          </Paper>
        </Box>
      </Stack>

      {/* Dialogo de nota semanal */}
      <Dialog open={isNoteDialogOpen} onClose={() => setIsNoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Editar Nota Semanal</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={4}
            fullWidth
            value={weeklyNote}
            onChange={(e) => setWeeklyNote(e.target.value)}
            placeholder="Escribe tus notas para esta semana..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIsNoteDialogOpen(false)} sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}>Cancelar</Button>
          <Button onClick={handleNoteSubmit} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', px: 3, boxShadow: 'none', transition: 'all 0.2s', '&:hover': { boxShadow: 2, transform: 'translateY(-2px)', bgcolor: 'primary.dark' } }}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openNutritionSummary}
        onClose={() => setOpenNutritionSummary(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            Resumen Nutricional
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setOpenNutritionSummary(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingNutrition ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : nutritionSummary ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Resumen Diario
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Calorías
                  </Typography>
                  <Typography variant="h5" align="center">
                    {Math.round(nutritionSummary.total_macros.protein_g * 4 +
                      nutritionSummary.total_macros.carbs_g * 4 +
                      nutritionSummary.total_macros.fat_g * 9)} kcal
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Macronutrientes
                  </Typography>
                  <Stack spacing={1}>
                    {Object.entries(nutritionSummary.total_macros).map(([key, value]) => (
                      <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ width: '40%' }}>
                          {key.replace('_g', '').charAt(0).toUpperCase() + key.replace('_g', '').slice(1)}:
                        </Typography>
                        <Typography variant="body1" sx={{ width: '30%', textAlign: 'center' }}>
                          {Math.round(Number(value))}g
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            width: '30%',
                            textAlign: 'right',
                            '& > span': {
                              backgroundColor: nutritionSummary.alerts[key.replace('_g', '')] === 'excess' ? 'error.main' : 'success.main',
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              display: 'inline-block',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              width: '100%'
                            }
                          }}
                        >
                          <span>
                            {nutritionSummary.alerts[key.replace('_g', '')] === 'excess' ? 'Exceso' : 'Normal'}
                          </span>
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    Micronutrientes
                  </Typography>
                  <Stack spacing={1}>
                    {Object.entries(nutritionSummary.total_micros).map(([key, value]) => (
                      <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ width: '40%' }}>
                          {key.replace('_mg', '').split('_').map(word =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}:
                        </Typography>
                        <Typography variant="body1" sx={{ width: '30%', textAlign: 'center' }}>
                          {Math.round(Number(value))}mg
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            width: '30%',
                            textAlign: 'right',
                            '& > span': {
                              backgroundColor: nutritionSummary.alerts[key.replace('_mg', '')] === 'excess' ? 'error.main' : 'success.main',
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              display: 'inline-block',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              width: '100%'
                            }
                          }}
                        >
                          <span>
                            {nutritionSummary.alerts[key.replace('_mg', '')] === 'excess' ? 'Exceso' : 'Normal'}
                          </span>
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Box>
          ) : (
            <Typography color="error">
              No se pudieron cargar los datos del resumen nutricional
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
