import React, { useState, useEffect } from 'react';
import { Typography, CircularProgress, Box, Paper, Alert } from '@mui/material';
import WeeklyDietViewer from '../WeeklyDietViewer';
import { getCurrentWeeklyDiet, WeeklyDiet } from '../../services/weeklyDiets';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const WeeklyDietPage: React.FC = () => {
    const [currentDiet, setCurrentDiet] = useState<WeeklyDiet | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCurrentDiet = async () => {
            try {
                const response = await getCurrentWeeklyDiet();
                if (!response || !response.week_start_date) {
                    throw new Error('La dieta semanal no tiene una fecha de inicio válida');
                }
                setCurrentDiet(response);
                setError(null);
            } catch (error: any) {
                console.error('Error al cargar la dieta semanal:', error);
                setError(error.message || 'No se pudo cargar la dieta semanal. Por favor, intenta de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentDiet();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom color="primary">
                        {error.includes('No se encontró una dieta semanal') ? 'No tienes una dieta semanal asignada' : 'Error en la dieta semanal'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {error.includes('No se encontró una dieta semanal')
                            ? 'Tu nutricionista aún no ha creado una dieta para esta semana.'
                            : error}
                    </Typography>
                </Paper>
            </Box>
        );
    }

    if (!currentDiet) {
        return (
            <Box sx={{ p: 4 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h5" gutterBottom color="primary">
                        No tienes una dieta semanal asignada
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Tu nutricionista aún no ha creado una dieta para esta semana.
                    </Typography>
                </Paper>
            </Box>
        );
    }

    let weekStartDate;
    let weekEndDate;
    let formattedDateRange = '';

    try {
        weekStartDate = parseISO(currentDiet.week_start_date);
        weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekEndDate.getDate() + 6);

        formattedDateRange = `${format(weekStartDate, "d 'de' MMMM", { locale: es })} - ${format(weekEndDate, "d 'de' MMMM", { locale: es })}`;
    } catch (error) {
        console.error('Error al formatear las fechas:', error);
        formattedDateRange = 'Fecha no disponible';
    }

    return (
        <Box sx={{ p: 4 }}>
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h4" gutterBottom color="primary">
                    Mi Dieta Semanal
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    {formattedDateRange}
                </Typography>
            </Paper>
            <WeeklyDietViewer weeklyDietId={currentDiet.id} />
        </Box>
    );
};

export default WeeklyDietPage; 