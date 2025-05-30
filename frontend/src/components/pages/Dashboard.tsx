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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Restaurant as RestaurantIcon, Person as PersonIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { healthService, professionalService } from '../../services/api';
import { WeightLog, WeeklySummary, WeeklyNote } from '../../types/health';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ReferenceLine } from 'recharts';
import { jwtDecode } from 'jwt-decode';
import { useGoalNotifications } from '../GoalNotifications';
import { useTheme } from '@mui/material/styles';
import { goalsService, GoalProgress } from '../../services/goals';

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
  const { showGoalNotification, hasShownNotification } = useGoalNotifications();
  const theme = useTheme();

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

  const fetchWeeklySummary = async () => {
    try {
      const summary = await healthService.getWeeklySummary();
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

      // Verificar objetivo de peso con las metas reales
      const activeWeightGoals = goalProgress.filter(
        g => g.goal.goal_type === 'weight' || g.goal.goal_type === 'both'
      );

      activeWeightGoals.forEach(goalProgressItem => {
        if (goalProgressItem.goal.target_weight && goalProgressItem.is_weight_achieved) {
          const weightGoalKey = `weight_${newWeight}_${goalProgressItem.goal.id}`;
          if (!hasShownNotification(weightGoalKey)) {
            showGoalNotification('weight', `¡Felicitaciones! ¡Alcanzaste tu peso objetivo de ${goalProgressItem.goal.target_weight} kg!`, weightGoalKey);
          }
        }
      });

      setWeight('');
      fetchWeeklySummary(); // Refresh the summary
      fetchGoalProgress(); // Refresh goal progress
    } catch (err: any) {
      // Intentar extraer el mensaje del backend
      let msg = 'Error al registrar el peso';
      if (err?.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail) && detail[0]?.msg) {
          msg = detail[0].msg;
        } else if (typeof detail === 'string') {
          msg = detail;
        }
        // Limpiar detalles técnicos si aparecen en el mensaje
        if (typeof msg === 'string') {
          msg = msg.replace(/\[type=.*?\]/gi, '').replace(/value_error:?\w*/gi, '').trim();
          msg = msg.replace(/^Value error,\s*/i, '');
        }
      } else if (err?.message && err.message.includes('peso')) {
        msg = err.message;
      }
      setWeightError(msg);
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

  // Obtener metas activas para los gráficos
  const weightGoals = goalProgress.filter(g =>
    g.goal.goal_type === 'weight' || g.goal.goal_type === 'both'
  );
  const calorieGoals = goalProgress.filter(g =>
    g.goal.goal_type === 'calories' || g.goal.goal_type === 'both'
  );

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

      {/* Progreso de peso (arriba, ancho completo) */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', minHeight: 340, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main', letterSpacing: '-0.5px' }}>
          Progreso de Peso
        </Typography>
        <Box sx={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklySummary.weight_data.weight_logs}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="date" stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary, fontSize: 13 }} />
              <YAxis stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary, fontSize: 13 }} />
              <Tooltip contentStyle={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.palette.divider}` }} />
              <Line type="monotone" dataKey="weight" stroke={theme.palette.primary.main} strokeWidth={3} dot={{ r: 5, fill: theme.palette.primary.main, stroke: 'white', strokeWidth: 2 }} activeDot={{ r: 7 }} isAnimationActive />
              {/* Líneas de meta de peso */}
              {weightGoals.map((goalProgress, index) => (
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
                      style: { fill: theme.palette.success.main, fontWeight: 600 }
                    }}
                  />
                )
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
          <Chip label={`Cambio: ${weeklySummary.weight_data.weight_change} kg`} color={weeklySummary.weight_data.weight_change >= 0 ? 'success' : 'error'} size="small" sx={{ borderRadius: 1, fontWeight: 600 }} />
          {weightGoals.map((goalProgress) => (
            goalProgress.goal.target_weight && (
              <Chip
                key={`weight-goal-chip-${goalProgress.goal.id}`}
                label={goalProgress.is_weight_achieved ? `✓ Meta alcanzada` : `Meta: ${goalProgress.goal.target_weight}kg`}
                color={goalProgress.is_weight_achieved ? 'success' : 'default'}
                size="small"
                sx={{ borderRadius: 1, fontWeight: 600 }}
              />
            )
          ))}
        </Stack>
      </Paper>

      {/* Gráfico de Calorías Diarias (si hay más de 1 día con datos O si hay metas activas) */}
      {(weeklySummary.calorie_data.daily_breakdown && weeklySummary.calorie_data.daily_breakdown.length > 1) ||
        (calorieGoals.length > 0 && weeklySummary.calorie_data.daily_breakdown && weeklySummary.calorie_data.daily_breakdown.length > 0) ? (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', minHeight: 340, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main', letterSpacing: '-0.5px' }}>
            Calorías Diarias
          </Typography>
          <Box sx={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklySummary.calorie_data.daily_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="date" stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary, fontSize: 13 }} />
                <YAxis stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary, fontSize: 13 }} />
                <Tooltip contentStyle={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.palette.divider}` }} />
                <Bar dataKey="calories" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} />
                {/* Líneas de meta de calorías */}
                {calorieGoals.map((goalProgress, index) => (
                  goalProgress.goal.target_calories && (
                    <ReferenceLine
                      key={`calorie-goal-${goalProgress.goal.id}`}
                      y={goalProgress.goal.target_calories}
                      stroke={theme.palette.warning.main}
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{
                        value: `Meta: ${goalProgress.goal.target_calories} cal`,
                        position: "top",
                        style: { fill: theme.palette.warning.main, fontWeight: 600 }
                      }}
                    />
                  )
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <Chip label={`Promedio: ${weeklySummary.calorie_data.average_daily_calories.toFixed(0)} cal/día`} color="primary" size="small" sx={{ borderRadius: 1, fontWeight: 600 }} />
            {calorieGoals.map((goalProgress) => (
              goalProgress.goal.target_calories && (
                <Chip
                  key={`calorie-goal-chip-${goalProgress.goal.id}`}
                  label={goalProgress.is_calories_achieved ? `✓ Meta alcanzada` : `Meta: ${goalProgress.goal.target_calories} cal`}
                  color={goalProgress.is_calories_achieved ? 'success' : 'default'}
                  size="small"
                  sx={{ borderRadius: 1, fontWeight: 600 }}
                />
              )
            ))}
          </Stack>
        </Paper>
      ) : null}

      {/* Mostrar metas de calorías incluso si no hay gráfico */}
      {calorieGoals.length > 0 && (!weeklySummary.calorie_data.daily_breakdown || weeklySummary.calorie_data.daily_breakdown.length === 0) && (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main', letterSpacing: '-0.5px' }}>
            Metas de Calorías
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            {calorieGoals.map((goalProgress) => (
              goalProgress.goal.target_calories && (
                <Box key={`calorie-goal-info-${goalProgress.goal.id}`} sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 2, bgcolor: 'background.paper' }}>
                  <Typography variant="body2" color="text.secondary">Meta diaria</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
                    {goalProgress.goal.target_calories} cal
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {goalProgress.is_calories_achieved ? '✓ Alcanzada' : 'Pendiente'}
                  </Typography>
                </Box>
              )
            ))}
            <Alert severity="info" sx={{ mt: 2 }}>
              Registra comidas para ver tu progreso hacia las metas de calorías.
            </Alert>
          </Stack>
        </Paper>
      )}

      {/* Segunda fila: Resumen de Calorías | Distribución de Comidas (misma altura) */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={3} sx={{ alignItems: 'stretch' }}>
        <Box sx={{ flex: 1, display: 'flex' }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', minHeight: 260, height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>Resumen de Calorías</Typography>
            <Stack spacing={1}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700, letterSpacing: '-1px' }}>{weeklySummary.calorie_data.total_calories.toFixed(0)}</Typography>
              <Typography variant="body2" color="text.secondary">calorías totales</Typography>
              <Divider />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>{weeklySummary.calorie_data.average_daily_calories.toFixed(0)}</Typography>
              <Typography variant="body2" color="text.secondary">promedio diario</Typography>
              <Typography variant="body2" color="text.secondary">{weeklySummary.calorie_data.days_logged} días registrados</Typography>
              {/* Agregar información de metas en el resumen */}
              {calorieGoals.length > 0 && (
                <>
                  <Divider />
                  {calorieGoals.map((goalProgress) => (
                    goalProgress.goal.target_calories && (
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
                      </Box>
                    )
                  ))}
                </>
              )}
            </Stack>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button variant="contained" fullWidth startIcon={<RestaurantIcon />} onClick={() => navigate('/weekly-diet')} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '1rem', boxShadow: 'none', transition: 'all 0.2s', '&:hover': { boxShadow: 2, transform: 'translateY(-2px)' } }}>Gestionar Dietas</Button>
              <Button variant="outlined" fullWidth onClick={() => navigate('/meals?add=true')} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, fontSize: '1rem', borderColor: theme.palette.primary.main, color: theme.palette.primary.main, '&:hover': { bgcolor: theme.palette.primary.light + '10', borderColor: theme.palette.primary.dark } }}>Agregar Comida</Button>
            </Stack>
          </Paper>
        </Box>
        <Box sx={{ flex: 1, display: 'flex' }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', minHeight: 260, height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>Distribución de Comidas</Typography>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', minHeight: 180, height: '100%' }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={Object.entries(weeklySummary.meal_trends.meal_distribution).map(([key, value]) => ({ name: mealLabelsES[key] || key, value }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    isAnimationActive
                  >
                    {Object.entries(weeklySummary.meal_trends.meal_distribution).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.main, theme.palette.warning.main][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'white', borderRadius: 8, border: `1px solid ${theme.palette.divider}` }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
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
    </Box>
  );
};

export default Dashboard;
