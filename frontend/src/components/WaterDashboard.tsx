import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    Chip,
    Stack,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    History as HistoryIcon,
    LocalDrink as DrinkIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import WaterGlass from './WaterGlass';
import { waterService, DailyWaterSummary, WaterIntakeSummary } from '../services/water';
import { GoalProgress } from '../services/goals';

interface WaterDashboardProps {
    waterGoals: GoalProgress[];
    onWaterAdded?: () => void;
    isPatientView?: boolean;
    patientId?: number;
}

const WaterDashboard: React.FC<WaterDashboardProps> = ({
    waterGoals,
    onWaterAdded,
    isPatientView = true,
    patientId
}) => {
    const theme = useTheme();
    const [dailySummary, setDailySummary] = useState<DailyWaterSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [intakeToDelete, setIntakeToDelete] = useState<number | null>(null);

    const fetchDailySummary = async () => {
        try {
            setError(null);
            const summary = isPatientView
                ? await waterService.getDailyWaterSummary()
                : await waterService.getPatientDailyWaterSummary(patientId!);
            setDailySummary(summary);
        } catch (err) {
            console.error('Error fetching water summary:', err);
            setError('Error al cargar el resumen de agua');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDailySummary();
    }, []);

    const handleAddWater = async () => {
        if (!isPatientView) return; // Los profesionales no pueden agregar agua

        try {
            console.log('Intentando agregar 250ml de agua...');
            const result = await waterService.addQuickWaterIntake();
            console.log('Agua agregada exitosamente:', result);
            await fetchDailySummary();
            onWaterAdded?.();
        } catch (err: any) {
            console.error('Error adding water:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            if (err.response?.data?.detail && Array.isArray(err.response.data.detail)) {
                console.error('Detailed validation errors:', err.response.data.detail);
                err.response.data.detail.forEach((error: any, index: number) => {
                    console.error(`Validation error ${index + 1}:`, error);
                });
            }
            setError(`Error al registrar agua: ${err.response?.data?.detail || err.message}`);
        }
    };

    const handleDeleteIntake = async () => {
        if (!intakeToDelete) return;

        try {
            await waterService.deleteWaterIntake(intakeToDelete);
            await fetchDailySummary();
            setDeleteDialogOpen(false);
            setIntakeToDelete(null);
            onWaterAdded?.();
        } catch (err) {
            console.error('Error deleting water intake:', err);
            setError('Error al eliminar registro de agua');
        }
    };

    const getWaterGoalInfo = () => {
        const waterGoal = waterGoals.find(goal => goal.goal.goal_type === 'water');
        if (!waterGoal || !waterGoal.goal.target_milliliters) {
            return { targetMl: 2000, hasGoal: false }; // Default 2L si no hay goal
        }
        return {
            targetMl: waterGoal.goal.target_milliliters,
            hasGoal: true,
            isAchieved: waterGoal.is_water_achieved || false,
            progress: waterGoal.current_daily_water || 0
        };
    };

    const formatTime = (timeString: string) => {
        return new Date(timeString).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                    <CircularProgress />
                </Box>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                <Alert severity="error">{error}</Alert>
            </Paper>
        );
    }

    const goalInfo = getWaterGoalInfo();
    const currentMl = dailySummary?.total_consumed_ml || 0;
    const targetMl = goalInfo.targetMl;

    return (
        <>
            <Paper elevation={0} sx={{
                p: 3,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                background: 'white',
                minHeight: 340
            }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                        letterSpacing: '-0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        <DrinkIcon />
                        Hidratación Diaria
                    </Typography>

                    <IconButton
                        onClick={() => setHistoryOpen(true)}
                        size="small"
                        sx={{ color: 'text.secondary' }}
                    >
                        <HistoryIcon />
                    </IconButton>
                </Box>

                <Box display="flex" justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
                    <WaterGlass
                        currentMl={currentMl}
                        targetMl={targetMl}
                        onAddWater={handleAddWater}
                        disabled={!isPatientView}
                    />
                </Box>

                {/* Información de meta */}
                <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mb: 2 }}>
                    {goalInfo.hasGoal ? (
                        <Chip
                            label={`Meta: ${targetMl}ml (${(targetMl / 250).toFixed(0)} vasos)`}
                            color={goalInfo.isAchieved ? 'success' : 'primary'}
                            size="small"
                            sx={{ borderRadius: 1, fontWeight: 600 }}
                            icon={<TrendingUpIcon fontSize="small" />}
                        />
                    ) : (
                        <Chip
                            label="Sin meta establecida (2L por defecto)"
                            color="default"
                            size="small"
                            sx={{ borderRadius: 1, fontWeight: 600 }}
                        />
                    )}

                    <Chip
                        label={`${dailySummary?.intakes_count || 0} registros hoy`}
                        color="info"
                        size="small"
                        sx={{ borderRadius: 1, fontWeight: 600 }}
                    />
                </Stack>

                {/* Progreso detallado */}
                {dailySummary && (
                    <Box textAlign="center">
                        <Typography variant="body2" color="text.secondary">
                            {dailySummary.remaining_ml > 0
                                ? `Faltan ${dailySummary.remaining_ml}ml (${dailySummary.remaining_glasses} vasos) para alcanzar tu meta`
                                : '¡Meta de hidratación alcanzada! 🎉'
                            }
                        </Typography>
                    </Box>
                )}

                {!goalInfo.hasGoal && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        {isPatientView
                            ? "Tu nutricionista puede establecer una meta de hidratación personalizada para ti."
                            : "Puedes establecer una meta de hidratación personalizada para este paciente en la pestaña de Gestión de Metas."
                        }
                    </Alert>
                )}
            </Paper>

            {/* Diálogo de historial */}
            <Dialog
                open={historyOpen}
                onClose={() => setHistoryOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <HistoryIcon />
                        Historial de Hidratación - Hoy
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {dailySummary && dailySummary.intakes.length > 0 ? (
                        <List>
                            {dailySummary.intakes.map((intake: WaterIntakeSummary) => (
                                <ListItem key={intake.id} divider>
                                    <ListItemText
                                        primary={`${intake.amount_ml}ml (${intake.amount_glasses} vasos)`}
                                        secondary={`${intake.time}${intake.notes ? ` - ${intake.notes}` : ''}`}
                                    />
                                    {isPatientView && (
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                onClick={() => {
                                                    setIntakeToDelete(intake.id);
                                                    setDeleteDialogOpen(true);
                                                }}
                                                color="error"
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography color="text.secondary" textAlign="center" py={4}>
                            No hay registros de agua para hoy
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setHistoryOpen(false)}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diálogo de confirmación de eliminación */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogContent>
                    <Typography>
                        ¿Estás seguro de que deseas eliminar este registro de agua?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeleteIntake}
                        color="error"
                        variant="contained"
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default WaterDashboard; 