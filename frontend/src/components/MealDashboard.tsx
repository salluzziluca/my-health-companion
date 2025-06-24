import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Stack, Divider, TextField, IconButton, Paper, Fade, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import AddMealModal from './AddMealModal';
import MealCard from './MealCard';
import AlertBanner from './AlertBanner';
import { Meal, NewMeal } from '../types/Meal';
import { getMeals, deleteMeal, createMeal, updateMeal } from '../services/meals';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';

interface Props {
  onMealsChange?: () => void;
}

const MealDashboard: React.FC<Props> = ({ onMealsChange }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [mealToEdit, setMealToEdit] = useState<Meal | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [allMeals, setAllMeals] = useState<Meal[]>([]);

  // Cargar todas las comidas al inicio
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const meals = await getMeals();
        setAllMeals(meals);
      } catch (err) {
        console.error('Error al obtener las comidas:', err);
      }
    };
    loadMeals();
  }, []);

  // Manejar el parámetro add=true en la URL
  useEffect(() => {
    const shouldOpenModal = searchParams.get('add') === 'true';
    if (shouldOpenModal) {
      setShowModal(true);
      setMealToEdit(undefined);
      // Limpiar el parámetro de la URL
      setSearchParams(params => {
        params.delete('add');
        return params;
      });
    }
  }, [searchParams, setSearchParams]);

  // Filtrar comidas cuando cambia la fecha seleccionada
  useEffect(() => {
    const filteredMeals = allMeals.filter((meal: Meal) => {
      const mealDate = new Date(meal.timestamp);
      const selectedDateStart = new Date(selectedDate);
      selectedDateStart.setHours(0, 0, 0, 0);
      const selectedDateEnd = new Date(selectedDate);
      selectedDateEnd.setHours(23, 59, 59, 999);
      return mealDate >= selectedDateStart && mealDate <= selectedDateEnd;
    });
    setMeals(filteredMeals);
  }, [selectedDate, allMeals]);

  const handleAddMeal = async (meal: NewMeal) => {
    try {
      const response = await api.post('/meals', meal);
      setAllMeals(prev => [...prev, response.data]);
      setTimeout(() => onMealsChange?.(), 0);
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };

  const handleEditMeal = async (mealId: number, meal: NewMeal) => {
    try {
      const response = await api.put(`/meals/${mealId}`, meal);
      setAllMeals(prev => prev.map(m => m.id === mealId ? response.data : m));
      setTimeout(() => onMealsChange?.(), 0);
    } catch (error) {
      console.error('Error editing meal:', error);
    }
  };

  const handleDeleteClick = (id: number) => {
    setMealToDelete(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!mealToDelete) return;
    try {
      await api.delete(`/meals/${mealToDelete}`);
      setAllMeals(prev => prev.filter(m => m.id !== mealToDelete));
      setTimeout(() => onMealsChange?.(), 0);
    } catch (error) {
      console.error('Error deleting meal:', error);
    } finally {
      setShowDeleteDialog(false);
      setMealToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setMealToDelete(null);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Tus comidas del {formatDate(selectedDate)}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          type="date"
          label="Seleccionar fecha"
          value={formatDateForInput(selectedDate)}
          onChange={(e) => {
            const [year, month, day] = e.target.value.split('-').map(Number);
            const newDate = new Date(year, month - 1, day);
            setSelectedDate(newDate);
          }}
          InputLabelProps={{ shrink: true }}
          sx={{ width: '200px' }}
        />
      </Box>

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
            <Typography variant="body2" color="text.secondary" align="center">No has registrado comidas para este día.</Typography>
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
        initialDate={selectedDate}
      />

      <Dialog
        open={showDeleteDialog}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar esta comida? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MealDashboard;
