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
} from '@mui/material';
import { WeeklyDietMeal, getWeeklyDietMeals, markMealAsCompleted, getFoodIngredients, getIngredientDetails, FoodWithIngredients, Ingredient } from '../services/weeklyDiets';

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
    const [selectedMeal, setSelectedMeal] = useState<WeeklyDietMeal | null>(null);
    const [foodDetails, setFoodDetails] = useState<FoodWithIngredients | null>(null);
    const [ingredientsDetails, setIngredientsDetails] = useState<{ [key: number]: Ingredient }>({});
    const [loadingIngredients, setLoadingIngredients] = useState(false);

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
            await markMealAsCompleted(mealId, completed, weeklyDietId, 100);
            setMeals(meals.map(meal =>
                meal.id === mealId ? { ...meal, completed } : meal
            ));
        } catch (error) {
            console.error('Error al actualizar el estado de la comida:', error);
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
                                        p: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Box
                                        sx={{ p: 1 }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Checkbox
                                            checked={meal.completed}
                                            onChange={(e) => {
                                                handleMealCompletion(meal.id, e.target.checked);
                                            }}
                                            color="primary"
                                        />
                                    </Box>
                                    <Box
                                        sx={{
                                            flex: 1,
                                            p: 1,
                                            cursor: 'pointer',
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                            },
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
        </Box>
    );
};

export default WeeklyDietViewer; 