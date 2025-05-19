import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Stack, Divider } from '@mui/material';
import AddMealModal from './AddMealModal';
import MealCard from './MealCard';
import AlertBanner from './AlertBanner';
import { Meal, NewMeal } from '../types/Meal';
import { getMeals, deleteMeal, createMeal } from '../services/meals';

const MealDashboard = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showModal, setShowModal] = useState(false);

  const totalCalories = meals.reduce((acc, m) => acc + m.calories, 0);
  const userTargetCalories = 2000; // TODO: reemplazar con dato real del usuario

  useEffect(() => {
    getMeals()
      .then(setMeals)
      .catch((err) => {
        console.error('Error al obtener las comidas:', err);
      });
  }, []);

  const handleAddMeal = async (newMeal: NewMeal) => {
    try {
      const created = await createMeal(newMeal);
      setMeals([...meals, created]);
    } catch (err) {
      console.error('Error al crear comida:', err);
    }
  };

  const handleDeleteMeal = async (id: number) => {
    try {
      await deleteMeal(id);
      setMeals(meals.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Error al eliminar comida:', err);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Tus comidas de hoy
      </Typography>

      <AlertBanner totalCalories={totalCalories} userTarget={userTargetCalories} />

      <Divider sx={{ my: 2 }} />

      <Stack spacing={2}>
        {meals.map((meal) => (
          <MealCard key={meal.id} meal={meal} onDelete={handleDeleteMeal} />
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

      <AddMealModal open={showModal} onClose={() => setShowModal(false)} onAdd={handleAddMeal} />
    </Box>
  );
};

export default MealDashboard;
