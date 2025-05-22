import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Stack, Divider } from '@mui/material';
import AddMealModal from './AddMealModal';
import MealCard from './MealCard';
import AlertBanner from './AlertBanner';
import { Meal, NewMeal } from '../types/Meal';
import { getMeals, deleteMeal, createMeal, updateMeal } from '../services/meals';

const MealDashboard = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [mealToEdit, setMealToEdit] = useState<Meal | undefined>(undefined);


  const totalCalories = meals.reduce((acc, m) => acc + m.calories, 0);
  const userTargetCalories = 2000;

  useEffect(() => {
    getMeals()
      .then(setMeals)
      .catch((err) => console.error('Error al obtener las comidas:', err.response?.data || err.message));
  }, []);

  const handleAddMeal = async (newMeal: NewMeal) => {
    try {
      const created = await createMeal(newMeal);
      setMeals([...meals, created]);
    } catch (err: any) {
      console.error('Error al crear comida:', err.response?.data || err.message);
    }
  };

  const handleEditMeal = async (mealId: number, updatedMeal: NewMeal) => {
    try {
      const updated = await updateMeal(mealId, updatedMeal);
      setMeals(meals.map((m) => (m.id === mealId ? updated : m)));
    } catch (err: any) {
      console.error('Error al editar comida:', err.response?.data || err.message);
    }
  };

  const handleDeleteMeal = async (id: number) => {
    try {
      await deleteMeal(id);
      setMeals(meals.filter((m) => m.id !== id));
    } catch (err: any) {
      console.error('Error al eliminar comida:', err.response?.data || err.message);
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
          setMealToEdit(undefined); // ✅ en lugar de null
        }}
        onAdd={handleAddMeal}
        onEdit={handleEditMeal}
        initialMeal={mealToEdit}
      />
    </Box>
  );
};

export default MealDashboard;
