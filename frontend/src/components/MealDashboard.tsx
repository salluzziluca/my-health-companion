import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Stack, Divider, TextField, IconButton, Paper, Fade, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import AddMealModal from './AddMealModal';
import MealCard from './MealCard';
import AlertBanner from './AlertBanner';
import { Meal, NewMeal } from '../types/Meal';
import { getMeals, deleteMeal, createMeal, updateMeal } from '../services/meals';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';

const MealDashboard = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [mealToEdit, setMealToEdit] = useState<Meal | undefined>(undefined);

  useEffect(() => {
    getMeals()
      .then(meals => {
        setMeals(meals);
      })
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
      const updatedMeals = meals.map((m) => (m.id === mealId ? updated : m));
      setMeals(updatedMeals);
    } catch (err: any) {
      console.error('Error al editar comida:', err.response?.data || err.message);
    }
  };

  const handleDeleteClick = (id: number) => {
    setMealToEdit(undefined);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Tus comidas de hoy
      </Typography>

      <AlertBanner totalCalories={meals.reduce((acc, m) => acc + m.calories, 0)} userTarget={2000} />

      <Button
        variant="contained"
        color="primary"
        onClick={() => { setShowModal(true); setMealToEdit(undefined); }}
        sx={{
          borderRadius: 1,
          fontWeight: 500,
          boxShadow: 'none',
          mb: 3,
          width: '100%',
          maxWidth: '100%',
          mx: 'auto',
          display: 'block',
          height: 36,
          minHeight: 0,
          py: 0,
          fontSize: '1rem',
          letterSpacing: 0.2,
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
            color: 'white',
          }
        }}
      >
        + Agregar Comida
      </Button>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}`, background: 'white', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Listado de comidas</Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
          {meals.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center">No has registrado comidas hoy.</Typography>
          ) : (
            meals.map((meal) => (
              <Fade in key={meal.id}>
                <Box>
                  <MealCard
                    meal={meal}
                    onEdit={() => { setShowModal(true); setMealToEdit(meal); }}
                    onDelete={() => handleDeleteClick(meal.id)}
                  />
                </Box>
              </Fade>
            ))
          )}
        </Stack>
      </Paper>

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
