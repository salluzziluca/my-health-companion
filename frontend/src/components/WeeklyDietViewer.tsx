import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    Checkbox,
    CircularProgress,
    Box,
    FormControlLabel,
    Chip,
    Stack,
    Divider,
} from '@mui/material';
import { WeeklyDietMeal, getWeeklyDietMeals, markMealAsCompleted } from '../services/weeklyDiets';

interface WeeklyDietViewerProps {
    weeklyDietId: number;
}

const mealTypeColors: { [key: string]: string } = {
    breakfast: '#FFB74D', // Naranja claro
    lunch: '#81C784',     // Verde claro
    dinner: '#64B5F6',    // Azul claro
    snack: '#BA68C8',     // Púrpura claro
};

const dayLabels: { [key: string]: string } = {
    lunes: 'Lunes',
    martes: 'Martes',
    miércoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sábado: 'Sábado',
    domingo: 'Domingo',
};

const mealTypeLabels: { [key: string]: string } = {
    breakfast: 'Desayuno',
    lunch: 'Almuerzo',
    dinner: 'Cena',
    snack: 'Snack',
};

const WeeklyDietViewer: React.FC<WeeklyDietViewerProps> = ({ weeklyDietId }) => {
    const [meals, setMeals] = useState<WeeklyDietMeal[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMeals = async () => {
        try {
            const response = await getWeeklyDietMeals(weeklyDietId);
            setMeals(response);
        } catch (error) {
            console.error('Error al cargar las comidas:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeals();
    }, [weeklyDietId]);

    const handleMealCompletion = async (mealId: number, completed: boolean) => {
        try {
            await markMealAsCompleted(mealId, completed);
            setMeals(meals.map(meal =>
                meal.id === mealId ? { ...meal, completed } : meal
            ));
        } catch (error) {
            console.error('Error al actualizar el estado de la comida:', error);
        }
    };

    const groupMealsByDay = () => {
        const grouped: { [key: string]: WeeklyDietMeal[] } = {};
        meals.forEach(meal => {
            if (!grouped[meal.day_of_week]) {
                grouped[meal.day_of_week] = [];
            }
            grouped[meal.day_of_week].push(meal);
        });
        return grouped;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    const groupedMeals = groupMealsByDay();
    const days = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

    return (
        <Box sx={{ p: 2 }}>
            {days.map((day) => (
                <Card key={day} sx={{ mb: 2, boxShadow: 2 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                            {dayLabels[day]}
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <List>
                            {groupedMeals[day]?.map((meal) => (
                                <ListItem
                                    key={meal.id}
                                    sx={{
                                        bgcolor: meal.completed ? 'action.hover' : 'transparent',
                                        borderRadius: 1,
                                        mb: 1,
                                    }}
                                >
                                    <Box sx={{ width: '100%' }}>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={meal.completed}
                                                        onChange={(e) => handleMealCompletion(meal.id, e.target.checked)}
                                                        color="primary"
                                                    />
                                                }
                                                label={
                                                    <Typography variant="body1">
                                                        {meal.meal_name}
                                                    </Typography>
                                                }
                                            />
                                            <Chip
                                                label={mealTypeLabels[meal.meal_of_the_day]}
                                                size="small"
                                                sx={{
                                                    bgcolor: mealTypeColors[meal.meal_of_the_day],
                                                    color: 'white',
                                                }}
                                            />
                                        </Stack>
                                    </Box>
                                </ListItem>
                            ))}
                            {!groupedMeals[day] && (
                                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                    No hay comidas programadas para este día
                                </Typography>
                            )}
                        </List>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};

export default WeeklyDietViewer; 