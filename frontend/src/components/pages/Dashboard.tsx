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
  Grid,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Restaurant as RestaurantIcon, Person as PersonIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { healthService, professionalService } from '../../services/api';
import { WeightLog, WeeklySummary, WeeklyNote } from '../../types/health';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { jwtDecode } from 'jwt-decode';

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
    }
  }, []);

  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWeightError(null);
    if (!weight) return;

    try {
      // Registrar el nuevo peso
      await healthService.logWeight(parseFloat(weight));

      // Actualizar el perfil con el nuevo peso
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/patients/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          weight: parseFloat(weight)
        }),
      });

      setWeight('');
      fetchWeeklySummary(); // Refresh the summary
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
    <Box sx={{ p: 3 }}>
      {/* Top Section: Weight Logging and Weekly Summary */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
        {/* Weight Logging Section */}
        <Box sx={{ width: { xs: '100%', md: '33%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Registrar Peso
              </Typography>
              <form onSubmit={handleWeightSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="Peso (kg)"
                    type="number"
                    value={weight}
                    onChange={(e) => { setWeight(e.target.value); setWeightError(null); }}
                    fullWidth
                    error={!!weightError}
                    helperText={weightError}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled={!weight}
                  >
                    Registrar
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Box>

        {/* Weekly Summary Section */}
        <Box sx={{ width: { xs: '100%', md: '67%' } }}>
          <Card>
            <CardContent>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle1">
                    Período: {weeklySummary.week_start_date} - {weeklySummary.week_end_date}
                  </Typography>
                  <Typography>
                    Cambio de peso: {weeklySummary.weight_data.weight_change} kg
                  </Typography>
                </Box>

                {/* Weight Chart */}
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklySummary.weight_data.weight_logs}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="weight" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>

                {/* Weekly Note */}
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle1">Nota Semanal:</Typography>
                    <IconButton onClick={() => setIsNoteDialogOpen(true)}>
                      <EditIcon />
                    </IconButton>
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {weeklySummary.notes || 'No hay notas para esta semana'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Bottom Section: Meal Summary */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Resumen de Comidas
          </Typography>
        </Box>
        <Stack spacing={2}>
          {/* Top Row: Calorie Summary and Meal Distribution */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            {/* Calorie Summary */}
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Calorías Totales: {weeklySummary.calorie_data.total_calories.toFixed(0)} kcal
                </Typography>
                <Typography variant="body2">
                  Promedio diario: {weeklySummary.calorie_data.average_daily_calories.toFixed(0)} kcal
                </Typography>
                <Typography variant="body2">
                  Días registrados: {weeklySummary.calorie_data.days_logged}
                </Typography>
              </Paper>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RestaurantIcon />}
                onClick={() => navigate('/meals')}
                size="large"
                fullWidth
                sx={{ mt: 3 }}
              >
                Gestionar Comidas
              </Button>
            </Box>

            {/* Meal Distribution */}
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Distribución de Comidas
                </Typography>
                <Box sx={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(weeklySummary.meal_trends.meal_distribution).map(([key, value]) => ({
                          name: key.charAt(0).toUpperCase() + key.slice(1),
                          value: value
                        }))}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {Object.entries(weeklySummary.meal_trends.meal_distribution).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Box>
          </Box>

          {/* Daily Calorie Breakdown */}
          <Box>
            <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 2, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Desglose Diario de Calorías
              </Typography>
              {weeklySummary.calorie_data.daily_breakdown.length === 1 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                    {Math.round(weeklySummary.calorie_data.daily_breakdown[0].calories)} kcal
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
                    Solo hay un día registrado.<br />¡Agrega más comidas para ver tu progreso semanal!
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklySummary.calorie_data.daily_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="calories" fill="#8884d8" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Paper>
          </Box>

          {/* Bottom Row: Favorite Foods and Meal Times */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            {/* Favorite Foods */}
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Comidas Favoritas
                </Typography>
                <Stack spacing={1}>
                  {weeklySummary.meal_trends.favorite_foods.map((food, index) => (
                    <Typography key={index} variant="body2">
                      {index + 1}. {food}
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            </Box>

            {/* Meal Times */}
            <Box sx={{ width: { xs: '100%', md: '50%' } }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Horario de Comidas
                </Typography>
                <Typography variant="body2">
                  Hora más frecuente: {weeklySummary.meal_trends.most_frequent_meal_time || 'No disponible'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Total de comidas: {weeklySummary.meal_trends.total_meals}
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* Weekly Note Dialog */}
      <Dialog open={isNoteDialogOpen} onClose={() => setIsNoteDialogOpen(false)}>
        <DialogTitle>Nota Semanal</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={4}
            value={weeklyNote}
            onChange={(e) => setWeeklyNote(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            inputProps={{ maxLength: 1000 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNoteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleNoteSubmit} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
