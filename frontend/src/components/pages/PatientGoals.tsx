import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  LinearProgress,
  useTheme,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
  Divider,
  Button
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from '../../services/axiosConfig';

interface Goal {
  id: number;
  goal_type: 'weight' | 'calories' | 'both';
  target_weight?: number;
  target_calories?: number;
  start_date: string;
  target_date?: string;
  status: 'active' | 'completed' | 'expired';
  progress: {
    current_weight?: number;
    current_daily_calories?: number;
    weight_progress?: number;
    calories_progress?: number;
    weight_progress_difference?: number;
    calories_progress_difference?: number;
    is_weight_achieved?: boolean;
    is_calories_achieved?: boolean;
  };
}

const PatientGoals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const [goalsResponse, progressResponse] = await Promise.all([
          axios.get('/goals/my-goals'),
          axios.get('/goals/my-goals/progress')
        ]);

        const goalsWithProgress = goalsResponse.data.map((goal: Goal) => {
          const progress = progressResponse.data.find((p: any) => p.goal_id === goal.id);
          return {
            ...goal,
            progress: progress || {}
          };
        });

        setGoals(goalsWithProgress);
        setError(null);
      } catch (err) {
        console.error('Error al cargar objetivos:', err);
        setError('No se pudieron cargar los objetivos. Por favor, intentá nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const getGoalTypeLabel = (goal_type: string) => {
    const types: { [key: string]: string } = {
      'weight': 'Peso',
      'calories': 'Calorías',
      'both': 'Peso y Calorías'
    };
    return types[goal_type] || goal_type;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'primary',
      'completed': 'success',
      'expired': 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'active': 'En progreso',
      'completed': 'Completado',
      'expired': 'Expirado'
    };
    return labels[status] || status;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha no disponible';
    }
  };

  const getProgressColor = (progress: number, isCompleted: boolean = false) => {
    if (isCompleted) return theme.palette.success.main;
    if (progress >= 90) return theme.palette.success.main;
    if (progress >= 70) return theme.palette.warning.main;
    if (progress >= 40) return theme.palette.info.main;
    return theme.palette.grey[500];
  };

  const getGoalDescription = (goal: Goal) => {
    if (goal.goal_type === 'weight') {
      return goal.target_weight ? `Alcanzar un peso de ${goal.target_weight} kg` : 'Objetivo de peso sin valor asignado';
    }
    if (goal.goal_type === 'calories') {
      return goal.target_calories ? `Consumir ${goal.target_calories} kcal/día` : 'Objetivo de calorías sin valor asignado';
    }
    if (goal.goal_type === 'both') {
      let desc = '';
      if (goal.target_weight) desc += `Alcanzar ${goal.target_weight} kg`;
      if (goal.target_calories) desc += (desc ? ' y ' : '') + `consumir ${goal.target_calories} kcal/día`;
      return desc || 'Objetivo mixto sin valores asignados';
    }
    return 'Objetivo sin información';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (goals.length === 0) {
    return (
      <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 900, mx: 'auto', width: '100%' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
          Mis Objetivos
        </Typography>
        <Alert severity="info">No tenés objetivos asignados. Tu nutricionista te asignará objetivos cuando sea necesario.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 900, mx: 'auto', width: '100%' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
        Mis Objetivos
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : goals.length === 0 ? (
        <Alert severity="info">No tenés objetivos asignados. Tu nutricionista te asignará objetivos cuando sea necesario.</Alert>
      ) : (
        <Stack spacing={3}>
          {goals.map((goal) => {
            // Determinar textos para estado actual y objetivo
            let estadoActual = '';
            let objetivo = '';
            if ((goal.goal_type === 'weight' || goal.goal_type === 'both') && goal.progress.current_weight !== undefined) {
              estadoActual = `${goal.progress.current_weight} kg`;
              objetivo = goal.target_weight ? `${goal.target_weight} kg` : '';
            } else if ((goal.goal_type === 'calories' || goal.goal_type === 'both') && goal.progress.current_daily_calories !== undefined) {
              estadoActual = `${goal.progress.current_daily_calories} kcal/día`;
              objetivo = goal.target_calories ? `${goal.target_calories} kcal/día` : '';
            }
            return (
              <Paper key={goal.id} elevation={1} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-start' }, mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5, textAlign: { xs: 'center', md: 'left' } }}>
                      {goal.goal_type === 'weight' && 'Objetivo de Peso'}
                      {goal.goal_type === 'calories' && 'Objetivo de Calorías'}
                      {goal.goal_type === 'both' && 'Objetivo de Peso y Calorías'}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 1, textAlign: { xs: 'center', md: 'left' } }}>
                      {getGoalDescription(goal)}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-end' }, justifyContent: 'flex-start', mt: { xs: 2, md: 0 } }}>
                    {(estadoActual || objetivo) && (
                      <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500, fontSize: 18, textAlign: { xs: 'center', md: 'right' } }}>
                        Estado actual: <span style={{ color: theme.palette.primary.main, fontWeight: 700 }}>{estadoActual}</span>
                        {objetivo && (
                          <span style={{ color: theme.palette.text.secondary, fontWeight: 400 }}> / Objetivo: <span style={{ color: theme.palette.primary.main, fontWeight: 700 }}>{objetivo}</span></span>
                        )}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1} sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Inicio: {formatDate(goal.start_date)}
                    {goal.target_date && goal.target_date !== '' && goal.target_date !== null ? ` | Fin: ${formatDate(goal.target_date)}` : ''}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Estado: {getStatusLabel(goal.status)}
                  </Typography>
                  {goal.status === 'completed' && (
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>¡Objetivo alcanzado!</Typography>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default PatientGoals; 