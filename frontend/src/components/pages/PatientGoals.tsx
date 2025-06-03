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
  type: 'weight' | 'calories' | 'both';
  target_weight?: number;
  target_calories?: number;
  start_date: string;
  end_date: string;
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

  const getGoalTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'weight': 'Peso',
      'calories': 'Calorías',
      'both': 'Peso y Calorías'
    };
    return types[type] || type;
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
          {goals.map((goal) => (
            <Paper key={goal.id} elevation={1} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1, textAlign: 'center' }}>
                {goal.type === 'weight' && 'Objetivo de Peso'}
                {goal.type === 'calories' && 'Objetivo de Calorías'}
                {goal.type === 'both' && 'Objetivo de Peso y Calorías'}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1} alignItems="center">
                {(goal.type === 'weight' || goal.type === 'both') && (
                  <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 800, mb: 1 }}>
                    {goal.target_weight ? `${goal.target_weight} kg` : 'No asignado'}
                  </Typography>
                )}
                {(goal.type === 'calories' || goal.type === 'both') && (
                  <Typography variant="h3" sx={{ color: 'secondary.main', fontWeight: 800, mb: 1 }}>
                    {goal.target_calories ? `${goal.target_calories} kcal/día` : 'No asignado'}
                  </Typography>
                )}
              </Stack>
              <Stack spacing={1}>
                {goal.progress.current_weight !== undefined && (
                  <Typography variant="body2">Peso actual: <b>{goal.progress.current_weight} kg</b></Typography>
                )}
                {goal.progress.current_daily_calories !== undefined && (
                  <Typography variant="body2">Calorías actuales: <b>{goal.progress.current_daily_calories} kcal/día</b></Typography>
                )}
                {goal.progress.weight_progress !== undefined && (
                  <LinearProgress variant="determinate" value={Math.min(goal.progress.weight_progress, 100)} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
                )}
                {goal.progress.calories_progress !== undefined && (
                  <LinearProgress variant="determinate" value={Math.min(goal.progress.calories_progress, 100)} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
                )}
                <Typography variant="caption" color="text.secondary">
                  Inicio: {formatDate(goal.start_date)} | Fin: {goal.end_date ? formatDate(goal.end_date) : 'No disponible'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Estado: {getStatusLabel(goal.status)}
                </Typography>
                {goal.status === 'completed' && (
                  <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>¡Objetivo alcanzado!</Typography>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default PatientGoals; 