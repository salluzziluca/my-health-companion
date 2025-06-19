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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Snackbar,
    Alert,
} from '@mui/material';
import { WeeklyDietMeal, getWeeklyDietMeals, markMealAsCompleted, getFoodIngredients, getIngredientDetails, FoodWithIngredients, Ingredient } from '../services/weeklyDiets';

interface WeeklyDietViewerProps {
    weeklyDietId: number;
    weekStartDate: string;
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

const getCompletionColor = (percentage: number) => {
    if (percentage === 100) return '#4caf50'; // Verde cuando está completo
    if (percentage >= 75) return '#2196f3'; // Azul cuando está cerca
    if (percentage >= 50) return '#ff9800'; // Naranja cuando está a la mitad
    return '#f44336'; // Rojo cuando está bajo
};

const WeeklyDietViewer: React.FC<WeeklyDietViewerProps> = ({ weeklyDietId, weekStartDate }) => {
    const [meals, setMeals] = useState<WeeklyDietMeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMeal, setSelectedMeal] = useState<WeeklyDietMeal | null>(null);
    const [foodDetails, setFoodDetails] = useState<FoodWithIngredients | null>(null);
    const [ingredientsDetails, setIngredientsDetails] = useState<{ [key: number]: Ingredient }>({});
    const [loadingIngredients, setLoadingIngredients] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

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

    const handleMealCompletion = async (mealId: number, completed: boolean, dayOfWeek: string) => {
        try {
            // Calcular el lunes de la semana actual
            const today = new Date();
            const dayOfWeekToday = today.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
            const daysToMonday = dayOfWeekToday === 0 ? 6 : dayOfWeekToday - 1; // Si es domingo, retroceder 6 días
            
            const mondayOfWeek = new Date(today);
            mondayOfWeek.setDate(today.getDate() - daysToMonday);
            mondayOfWeek.setHours(0, 0, 0, 0);

            // Calcular el índice del día de la semana
            const dayIndex = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'].indexOf(dayOfWeek);

            // Crear la fecha del día específico
            const targetDate = new Date(mondayOfWeek);
            targetDate.setDate(mondayOfWeek.getDate() + dayIndex);
            targetDate.setHours(12, 0, 0, 0);

            console.log('Debug - today:', today);
            console.log('Debug - dayOfWeekToday:', dayOfWeekToday);
            console.log('Debug - daysToMonday:', daysToMonday);
            console.log('Debug - mondayOfWeek:', mondayOfWeek);
            console.log('Debug - dayOfWeek:', dayOfWeek);
            console.log('Debug - dayIndex:', dayIndex);
            console.log('Debug - targetDate:', targetDate);
            console.log('Debug - targetDate.toISOString():', targetDate.toISOString());
            console.log('Debug - current date:', new Date().toISOString());

            await markMealAsCompleted(mealId, completed, weeklyDietId, 100, targetDate.toISOString());
            setMeals(meals.map(meal =>
                meal.id === mealId ? { ...meal, completed } : meal
            ));

            setSnackbar({
                open: true,
                message: completed ? 'Comida marcada como completada' : 'Comida desmarcada',
                severity: 'success'
            });
        } catch (error: any) {
            console.error('Error al actualizar el estado de la comida:', error);

            let errorMessage = 'Error al actualizar el estado de la comida';

            if (error.response?.status === 400) {
                errorMessage = 'No se puede completar esta comida. Verifica que sea el día correcto.';
            } else if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    const handleMealClick = async (meal: WeeklyDietMeal) => {
        setSelectedMeal(meal);
        setLoadingIngredients(true);
        try {
            const foodData = await getFoodIngredients(meal.food_id);
            setFoodDetails(foodData);

            // Obtener detalles de cada ingrediente
            const ingredientDetailsPromises = foodData.ingredients.map(async (ingredient) => {
                const details = await getIngredientDetails(ingredient.ingredient_id);
                return { id: ingredient.ingredient_id, details };
            });

            const ingredientsData = await Promise.all(ingredientDetailsPromises);
            const ingredientsMap = ingredientsData.reduce((acc, { id, details }) => {
                acc[id] = details;
                return acc;
            }, {} as { [key: number]: Ingredient });

            setIngredientsDetails(ingredientsMap);
        } catch (error) {
            console.error('Error al cargar los ingredientes:', error);
            setFoodDetails(null);
            setIngredientsDetails({});
        } finally {
            setLoadingIngredients(false);
        }
    };

    const handleCloseDialog = () => {
        setSelectedMeal(null);
        setFoodDetails(null);
        setIngredientsDetails({});
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

    // Calcular porcentaje de completado por día
    const getCompletionPercentage = (meals: WeeklyDietMeal[] = []) => {
        if (!meals.length) return 0;
        const completed = meals.filter(m => m.completed).length;
        return Math.round((completed / meals.length) * 100);
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
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
        <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 900, mx: 'auto', width: '100%' }}>
            {days.map((day) => {
                const dayMeals = groupedMeals[day] || [];
                const completion = getCompletionPercentage(dayMeals);
                return (
                    <Paper key={day} elevation={0} sx={{ mb: 3, borderRadius: 3, border: `1px solid #eee`, background: 'white', boxShadow: 2 }}>
                        <Box sx={{ p: 3 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '-0.5px' }}>
                                    {dayLabels[day]}
                                </Typography>
                                <Chip
                                    label={`${completion}% completado`}
                                    sx={{
                                        fontWeight: 600,
                                        borderRadius: 1,
                                        fontSize: '1rem',
                                        bgcolor: getCompletionColor(completion),
                                        color: 'white',
                                        transition: 'background-color 0.3s ease'
                                    }}
                                />
                            </Stack>
                            <Divider sx={{ mb: 2 }} />
                            <List>
                                {dayMeals.length > 0 ? dayMeals.map((meal) => (
                                    <ListItem
                                        key={meal.id}
                                        sx={{
                                            bgcolor: meal.completed ? 'action.hover' : 'transparent',
                                            borderRadius: 1,
                                            mb: 1,
                                            p: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Box sx={{ p: 1 }} onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={meal.completed}
                                                onChange={(e) => {
                                                    handleMealCompletion(meal.id, e.target.checked, day);
                                                }}
                                                color="primary"
                                            />
                                        </Box>
                                        <Box
                                            sx={{
                                                flex: 1,
                                                p: 1,
                                                cursor: 'pointer',
                                                '&:hover': { bgcolor: 'action.hover' },
                                                borderRadius: 1,
                                            }}
                                            onClick={() => handleMealClick(meal)}
                                        >
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <Typography variant="body1">
                                                    {meal.meal_name}
                                                </Typography>
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
                                )) : (
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                        No hay comidas programadas para este día
                                    </Typography>
                                )}
                            </List>
                        </Box>
                    </Paper>
                );
            })}

            <Dialog
                open={!!selectedMeal}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {foodDetails?.food_name || selectedMeal?.meal_name}
                    <Chip
                        label={selectedMeal ? mealTypeLabels[selectedMeal.meal_of_the_day] : ''}
                        size="small"
                        sx={{
                            bgcolor: selectedMeal ? mealTypeColors[selectedMeal.meal_of_the_day] : '',
                            color: 'white',
                            ml: 2,
                        }}
                    />
                </DialogTitle>
                <DialogContent>
                    {loadingIngredients ? (
                        <Box display="flex" justifyContent="center" p={3}>
                            <CircularProgress />
                        </Box>
                    ) : !foodDetails?.ingredients || foodDetails.ingredients.length === 0 ? (
                        <Typography variant="body1" align="center" sx={{ py: 3 }}>
                            No se encontraron ingredientes para esta comida
                        </Typography>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Ingrediente</TableCell>
                                        <TableCell align="right">Gramos</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {foodDetails.ingredients.map((ingredient) => {
                                        const details = ingredientsDetails[ingredient.ingredient_id];
                                        return (
                                            <TableRow key={ingredient.id}>
                                                <TableCell>{details?.name || `Ingrediente ${ingredient.ingredient_id}`}</TableCell>
                                                <TableCell align="right">{ingredient.grams}g</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cerrar</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default WeeklyDietViewer; 