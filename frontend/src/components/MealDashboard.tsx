import React, { useState } from 'react';
import { Box, Typography, Button, Stack, Divider } from '@mui/material';
import AddMealModal from './AddMealModal';
import MealCard from './MealCard';
import AlertBanner from './AlertBanner';
import { Meal, NewMeal } from '../types/Meal'; // ✅ ya está el tipo importado

const MealDashboard = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showModal, setShowModal] = useState(false);

  const totalCalories = meals.reduce((acc, m) => acc + m.calories, 0);
  const userTargetCalories = 2000; // Este dato vendría de los datos personales del usuario

  const handleAddMeal = (meal: NewMeal) => {
    setMeals([...meals, { ...meal, id: Date.now() }]);
  };

  const handleDeleteMeal = (id: number) => {
    setMeals(meals.filter(m => m.id !== id));
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>Tus comidas de hoy</Typography>

      <AlertBanner totalCalories={totalCalories} userTarget={userTargetCalories} />

      <Divider sx={{ my: 2 }} />

      <Stack spacing={2}>
        {meals.map(meal => (
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

      <AddMealModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onAdd={handleAddMeal}
        />
    </Box>
  );
};

export default MealDashboard;
