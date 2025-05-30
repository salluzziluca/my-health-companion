import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Stack, Divider, TextField, IconButton } from '@mui/material';
import AddMealModal from './AddMealModal';
import MealCard from './MealCard';
import AlertBanner from './AlertBanner';
import { Meal, NewMeal } from '../types/Meal';
import { getMeals, deleteMeal, createMeal, updateMeal } from '../services/meals';
import { useGoalNotifications } from './GoalNotifications';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

// Objetivos simulados (esto vendría del backend en el futuro)
const GOALS = {
  mealsPerDay: 5,
  caloriesPerDay: 2000,
  streakDays: 3,
  targetWeight: 75, // Peso objetivo en kg
  weightTolerance: 0.5 // Tolerancia en kg para considerar que se alcanzó el objetivo
};

const MealDashboard = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [mealToEdit, setMealToEdit] = useState<Meal | undefined>(undefined);
  const { showGoalNotification, hasShownNotification } = useGoalNotifications();
  const [currentWeight, setCurrentWeight] = useState(76.5);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [tempWeight, setTempWeight] = useState(currentWeight);

  const totalCalories = meals.reduce((acc, m) => acc + m.calories, 0);
  const userTargetCalories = GOALS.caloriesPerDay;

  // Función para verificar objetivos
  const checkGoals = (updatedMeals: Meal[]) => {
    // Verificar objetivo de comidas por día
    const mealsGoalKey = `meals_${new Date().toISOString().split('T')[0]}`;
    if (updatedMeals.length === GOALS.mealsPerDay && !hasShownNotification(mealsGoalKey)) {
      showGoalNotification('meals', `¡Felicitaciones! Alcanzaste tu objetivo de ${GOALS.mealsPerDay} comidas por día.`, mealsGoalKey);
    }

    // Verificar objetivo de calorías
    const totalCalories = updatedMeals.reduce((acc, m) => acc + m.calories, 0);
    const caloriesGoalKey = `calories_${new Date().toISOString().split('T')[0]}`;
    if (totalCalories >= GOALS.caloriesPerDay * 0.9 && 
        totalCalories <= GOALS.caloriesPerDay * 1.1 && 
        !hasShownNotification(caloriesGoalKey)) {
      showGoalNotification('calories', `¡Excelente! Mantuviste tus calorías dentro del rango objetivo.`, caloriesGoalKey);
    }

    // Verificar objetivo de peso
    const weightGoalKey = `weight_${currentWeight}`;
    if (Math.abs(currentWeight - GOALS.targetWeight) <= GOALS.weightTolerance && 
        !hasShownNotification(weightGoalKey)) {
      showGoalNotification('weight', `¡Felicitaciones! ¡Alcanzaste tu peso objetivo de ${GOALS.targetWeight} kg!`, weightGoalKey);
    }
  };

  const handleWeightChange = () => {
    setCurrentWeight(tempWeight);
    setIsEditingWeight(false);
    checkGoals(meals); // Verificar objetivos con el nuevo peso
  };

  useEffect(() => {
    getMeals()
      .then(meals => {
        setMeals(meals);
        checkGoals(meals);
      })
      .catch((err) => console.error('Error al obtener las comidas:', err.response?.data || err.message));
  }, []);

  const handleAddMeal = async (newMeal: NewMeal) => {
    try {
      const created = await createMeal(newMeal);
      const updatedMeals = [...meals, created];
      setMeals(updatedMeals);
      checkGoals(updatedMeals);
    } catch (err: any) {
      console.error('Error al crear comida:', err.response?.data || err.message);
    }
  };

  const handleEditMeal = async (mealId: number, updatedMeal: NewMeal) => {
    try {
      const updated = await updateMeal(mealId, updatedMeal);
      const updatedMeals = meals.map((m) => (m.id === mealId ? updated : m));
      setMeals(updatedMeals);
      checkGoals(updatedMeals);
    } catch (err: any) {
      console.error('Error al editar comida:', err.response?.data || err.message);
    }
  };

  const handleDeleteMeal = async (id: number) => {
    try {
      await deleteMeal(id);
      const updatedMeals = meals.filter((m) => m.id !== id);
      setMeals(updatedMeals);
      checkGoals(updatedMeals);
    } catch (err: any) {
      console.error('Error al eliminar comida:', err.response?.data || err.message);
    }
  };

  return (
    <Box p={4}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Tus comidas de hoy
        </Typography>
        
        {/* Control temporal de peso */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isEditingWeight ? (
            <>
              <TextField
                type="number"
                size="small"
                value={tempWeight}
                onChange={(e) => setTempWeight(Number(e.target.value))}
                inputProps={{ step: 0.1 }}
                sx={{ width: '100px' }}
              />
              <IconButton onClick={handleWeightChange} color="primary">
                <SaveIcon />
              </IconButton>
            </>
          ) : (
            <>
              <Typography variant="body1">
                Peso actual: {currentWeight} kg
              </Typography>
              <IconButton onClick={() => setIsEditingWeight(true)} size="small">
                <EditIcon />
              </IconButton>
            </>
          )}
        </Box>
      </Box>

      <AlertBanner totalCalories={totalCalories} userTarget={userTargetCalories} />

      <Divider sx={{ my: 2 }} />

      <Stack spacing={2}>
        {meals.map((meal) => (
          <MealCard
            key={meal.id}
            meal={meal}
            onDelete={handleDeleteMeal}
            onEdit={(meal) => {
              setMealToEdit(meal);
              setShowModal(true);
            }}
          />
        ))}
      </Stack>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 4 }}
        onClick={() => setShowModal(true)}
      >
        Agregar nueva comida
      </Button>

      <AddMealModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setMealToEdit(undefined);
        }}
        onAdd={handleAddMeal}
        onEdit={handleEditMeal}
        initialMeal={mealToEdit}
      />
    </Box>
  );
};

export default MealDashboard;
