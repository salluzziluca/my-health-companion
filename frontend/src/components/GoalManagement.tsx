import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Chip,
    Alert,
    CircularProgress,
    IconButton,
    Divider,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CheckCircle as CheckCircleIcon,
    TrendingUp as TrendingUpIcon,
    LocalDining as CaloriesIcon,
    FitnessCenter as WeightIcon,
} from '@mui/icons-material';
import { goalsService, Goal, GoalProgress } from '../services/goals';

interface GoalManagementProps {
    patientId?: number;
}

interface GoalFormData {
    goal_type: 'weight' | 'calories' | 'both';
    target_weight?: number;
    target_calories?: number;
    start_date: string;
    target_date: string;
}

const GoalManagement: React.FC<GoalManagementProps> = ({ patientId: propPatientId }) => {
    const { patientId: urlPatientId } = useParams<{ patientId: string }>();
    const patientId = propPatientId || (urlPatientId ? parseInt(urlPatientId, 10) : undefined);

    const [goals, setGoals] = useState<Goal[]>([]);
    const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [formData, setFormData] = useState<GoalFormData>({
        goal_type: 'weight',
        target_weight: undefined,
        target_calories: undefined,
        start_date: new Date().toISOString().split('T')[0],
        target_date: '',
    });

    const fetchGoals = async () => {
        if (!patientId) return;
        
        try {
            setLoading(true);
            setError(null);
            const [goalsData, progressData] = await Promise.all([
                goalsService.getPatientGoals(patientId),
                goalsService.getPatientGoalsProgress(patientId),
            ]);
            setGoals(goalsData);
            setGoalProgress(progressData);
        } catch (err) {
            console.error('Error fetching goals:', err);
            setError('Error al cargar las metas del paciente');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (patientId) {
            fetchGoals();
        }
    }, [patientId]);

    if (!patientId) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">ID de paciente no válido</Alert>
            </Box>
        );
    }

    const handleCreateGoal = async () => {
        try {
            setError(null);
            const goalData = {
                ...formData,
                patient_id: patientId,
                target_weight: formData.goal_type === 'calories' ? undefined : formData.target_weight,
                target_calories: formData.goal_type === 'weight' ? undefined : formData.target_calories,
            };

            if (editingGoal) {
                await goalsService.updateGoal(editingGoal.id, goalData);
            } else {
                await goalsService.createGoal(goalData);
            }

            setIsDialogOpen(false);
            setEditingGoal(null);
            resetForm();
            await fetchGoals();
        } catch (err) {
            console.error('Error creating/updating goal:', err);
            setError('Error al crear/actualizar la meta');
        }
    };

    const handleEditGoal = (goal: Goal) => {
        setEditingGoal(goal);
        setFormData({
            goal_type: goal.goal_type,
            target_weight: goal.target_weight || undefined,
            target_calories: goal.target_calories || undefined,
            start_date: goal.start_date,
            target_date: goal.target_date,
        });
        setIsDialogOpen(true);
    };

    const handleDeleteGoal = async (goalId: number) => {
        try {
            setError(null);
            await goalsService.deleteGoal(goalId);
            await fetchGoals();
        } catch (err) {
            console.error('Error deleting goal:', err);
            setError('Error al eliminar la meta');
        }
    };

    const handleCompleteGoal = async (goalId: number) => {
        try {
            setError(null);
            await goalsService.completeGoal(goalId);
            await fetchGoals();
        } catch (err) {
            console.error('Error completing goal:', err);
            setError('Error al marcar meta como completada');
        }
    };

    const resetForm = () => {
        setFormData({
            goal_type: 'weight',
            target_weight: undefined,
            target_calories: undefined,
            start_date: new Date().toISOString().split('T')[0],
            target_date: '',
        });
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingGoal(null);
        resetForm();
    };

    const getGoalTypeIcon = (type: string) => {
        switch (type) {
            case 'weight':
                return <WeightIcon />;
            case 'calories':
                return <CaloriesIcon />;
            case 'both':
                return <TrendingUpIcon />;
            default:
                return <TrendingUpIcon />;
        }
    };

    const getGoalTypeLabel = (type: string) => {
        switch (type) {
            case 'weight':
                return 'Peso';
            case 'calories':
                return 'Calorías';
            case 'both':
                return 'Peso y Calorías';
            default:
                return type;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'primary';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'default';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active':
                return 'Activa';
            case 'completed':
                return 'Completada';
            case 'cancelled':
                return 'Cancelada';
            default:
                return status;
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

    // Función para obtener el color del progreso
    const getProgressColor = (progress: number, isCompleted: boolean = false): 'success' | 'warning' | 'info' | 'default' => {
        if (isCompleted) return 'success';
        if (progress >= 90) return 'success';
        if (progress >= 70) return 'warning';
        if (progress >= 40) return 'info';
        return 'default';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Gestión de Metas</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsDialogOpen(true)}
                    sx={{ borderRadius: 2 }}
                >
                    Nueva Meta
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {goals.length === 0 ? (
                <Alert severity="info">
                    Este paciente no tiene metas asignadas. Puedes crear una nueva meta usando el botón "Nueva Meta".
                </Alert>
            ) : (
                <Stack spacing={2}>
                    {goals.map((goal) => {
                        const progress = goalProgress.find(p => p.goal.id === goal.id);
                        return (
                            <Card variant="outlined" key={goal.id}>
                                <CardContent>
                                    <Stack spacing={2}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                {getGoalTypeIcon(goal.goal_type)}
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {getGoalTypeLabel(goal.goal_type)}
                                                </Typography>
                                            </Stack>
                                            <Chip
                                                label={getStatusLabel(goal.status)}
                                                color={getStatusColor(goal.status) as any}
                                                size="small"
                                            />
                                        </Box>

                                        <Divider />

                                        {/* Objetivos */}
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                Objetivos:
                                            </Typography>
                                            {goal.target_weight && (
                                                <Typography variant="body1">
                                                    • Peso objetivo: <strong>{goal.target_weight} kg</strong>
                                                </Typography>
                                            )}
                                            {goal.target_calories && (
                                                <Typography variant="body1">
                                                    • Calorías diarias: <strong>{goal.target_calories} cal</strong>
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* Progreso */}
                                        {progress && (
                                            <Box>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    Progreso actual:
                                                </Typography>
                                                {progress.current_weight && (
                                                    <Typography variant="body2">
                                                        Peso actual: <strong>{progress.current_weight} kg</strong>
                                                        {progress.weight_progress_difference !== null && progress.weight_progress_difference !== undefined && (
                                                            <span style={{ color: progress.weight_progress_difference > 0 ? '#f44336' : '#4caf50' }}>
                                                                {' '}({progress.weight_progress_difference > 0 ? '+' : ''}{progress.weight_progress_difference} kg)
                                                            </span>
                                                        )}
                                                    </Typography>
                                                )}
                                                {progress.current_daily_calories && (
                                                    <Typography variant="body2">
                                                        Calorías promedio: <strong>{progress.current_daily_calories} cal/día</strong>
                                                        {progress.calories_progress_difference !== null && progress.calories_progress_difference !== undefined && (
                                                            <span style={{ color: Math.abs(progress.calories_progress_difference) <= (goal.target_calories || 0) * 0.05 ? '#4caf50' : '#f44336' }}>
                                                                {' '}({progress.calories_progress_difference > 0 ? '+' : ''}{progress.calories_progress_difference} cal)
                                                            </span>
                                                        )}
                                                    </Typography>
                                                )}
                                                {progress.days_remaining !== null && (
                                                    <Typography variant="body2">
                                                        Días restantes: <strong>{progress.days_remaining}</strong>
                                                    </Typography>
                                                )}
                                                {/* Mostrar información de progreso más útil */}
                                                {(goal.goal_type === 'weight' || goal.goal_type === 'both') && progress.current_weight && (
                                                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                                                        {progress.is_weight_achieved ? (
                                                            <span style={{ color: '#4caf50' }}>✓ Meta de peso alcanzada</span>
                                                        ) : progress.weight_progress_difference !== null && progress.weight_progress_difference !== undefined ? (
                                                            Math.abs(progress.weight_progress_difference) <= 0.5 ? (
                                                                <span style={{ color: '#ff9800' }}>Meta de peso casi alcanzada (diferencia: {Math.abs(progress.weight_progress_difference).toFixed(1)}kg)</span>
                                                            ) : (
                                                                <span style={{ color: '#1976d2' }}>
                                                                    Progreso de peso: faltan {Math.abs(progress.weight_progress_difference).toFixed(1)}kg
                                                                </span>
                                                            )
                                                        ) : (
                                                            <span style={{ color: '#757575' }}>Progreso de peso: datos insuficientes</span>
                                                        )}
                                                    </Typography>
                                                )}
                                                {(goal.goal_type === 'calories' || goal.goal_type === 'both') && progress.current_daily_calories && (
                                                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                                                        Progreso de calorías: <span style={{ color: getProgressColor(calculateCalorieProgress(progress), progress.is_calories_achieved || false) === 'success' ? '#4caf50' : '#ff9800' }}>
                                                            {calculateCalorieProgress(progress)}%
                                                        </span>
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}

                                        {/* Fechas */}
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Período: {new Date(goal.start_date).toLocaleDateString()} - {new Date(goal.target_date).toLocaleDateString()}
                                            </Typography>
                                        </Box>

                                        {/* Estado de logro */}
                                        {progress && (
                                            <Box>
                                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                                    {progress.is_weight_achieved !== null && (
                                                        <Chip
                                                            size="small"
                                                            label={progress.is_weight_achieved ? "✓ Peso logrado" : "Peso pendiente"}
                                                            color={progress.is_weight_achieved ? "success" : "default"}
                                                        />
                                                    )}
                                                    {progress.is_calories_achieved !== null && (
                                                        <Chip
                                                            size="small"
                                                            label={progress.is_calories_achieved ? "✓ Calorías logradas" : "Calorías pendientes"}
                                                            color={progress.is_calories_achieved ? "success" : "default"}
                                                        />
                                                    )}
                                                    {progress.is_fully_achieved && (
                                                        <Chip
                                                            size="small"
                                                            label="🎉 Meta completada"
                                                            color="success"
                                                            variant="filled"
                                                        />
                                                    )}
                                                </Stack>
                                            </Box>
                                        )}

                                        {/* Acciones */}
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            {goal.status === 'active' && (
                                                <IconButton
                                                    size="small"
                                                    color="success"
                                                    onClick={() => handleCompleteGoal(goal.id)}
                                                    title="Marcar como completada"
                                                >
                                                    <CheckCircleIcon />
                                                </IconButton>
                                            )}
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleEditGoal(goal)}
                                                title="Editar meta"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteGoal(goal.id)}
                                                title="Eliminar meta"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stack>
            )}

            {/* Dialog para crear/editar meta */}
            <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingGoal ? 'Editar Meta' : 'Nueva Meta'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <TextField
                            select
                            label="Tipo de Meta"
                            value={formData.goal_type}
                            onChange={(e) => setFormData({ ...formData, goal_type: e.target.value as any })}
                            fullWidth
                        >
                            <MenuItem value="weight">Solo Peso</MenuItem>
                            <MenuItem value="calories">Solo Calorías</MenuItem>
                            <MenuItem value="both">Peso y Calorías</MenuItem>
                        </TextField>

                        {(formData.goal_type === 'weight' || formData.goal_type === 'both') && (
                            <TextField
                                label="Peso Objetivo (kg)"
                                type="number"
                                value={formData.target_weight || ''}
                                onChange={(e) => setFormData({ ...formData, target_weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                                fullWidth
                                inputProps={{ min: 1, max: 300, step: 0.1 }}
                            />
                        )}

                        {(formData.goal_type === 'calories' || formData.goal_type === 'both') && (
                            <TextField
                                label="Calorías Diarias Objetivo"
                                type="number"
                                value={formData.target_calories || ''}
                                onChange={(e) => setFormData({ ...formData, target_calories: e.target.value ? parseInt(e.target.value) : undefined })}
                                fullWidth
                                inputProps={{ min: 500, max: 5000, step: 50 }}
                            />
                        )}

                        <TextField
                            label="Fecha de Inicio"
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            label="Fecha Objetivo"
                            type="date"
                            value={formData.target_date}
                            onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: formData.start_date }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateGoal}
                        disabled={
                            !formData.target_date ||
                            (formData.goal_type === 'weight' && !formData.target_weight) ||
                            (formData.goal_type === 'calories' && !formData.target_calories) ||
                            (formData.goal_type === 'both' && (!formData.target_weight || !formData.target_calories))
                        }
                    >
                        {editingGoal ? 'Actualizar' : 'Crear Meta'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GoalManagement; 