import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Autocomplete, MenuItem
} from '@mui/material';
import { Meal, NewMeal } from '../types/Meal';
import { getAllFoods } from '../services/foods';

interface FoodOption {
  id: number;
  food_name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (meal: NewMeal) => void;
  onEdit?: (mealId: number, meal: NewMeal) => void;
  initialMeal?: Meal;
}

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
const mealTypeLabels: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
};

const AddMealModal: React.FC<Props> = ({ open, onClose, onAdd, onEdit, initialMeal }) => {
  const [foods, setFoods] = useState<FoodOption[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodOption | null>(null);
  const [grams, setGrams] = useState('');
  const [mealType, setMealType] = useState('');

  useEffect(() => {
    getAllFoods()
      .then(setFoods)
      .catch((err) => console.error('Error cargando foods:', err));
  }, []);

  useEffect(() => {
    if (initialMeal) {
      setSelectedFood({ id: initialMeal.food_id, food_name: initialMeal.meal_name });
      setGrams(initialMeal.grams.toString());
      setMealType(initialMeal.meal_of_the_day);
    }
  }, [initialMeal]);

  const handleConfirm = () => {
    if (!selectedFood || !grams || !mealType) return;

    const parsedGrams = parseInt(grams);
    if (isNaN(parsedGrams)) return;

    const payload: NewMeal = {
      food_id: selectedFood.id,
      grams: parsedGrams,
      meal_of_the_day: mealType,
      meal_name: selectedFood.food_name,
      timestamp: new Date().toISOString(),
    };

    if (initialMeal && onEdit) {
      onEdit(initialMeal.id, payload);
    } else {
      onAdd(payload);
    }
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setSelectedFood(null);
    setGrams('');
    setMealType('');
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{initialMeal ? 'Editar Comida' : 'Agregar Comida'}</DialogTitle>
      <DialogContent>
        <Autocomplete
          options={foods}
          getOptionLabel={(option) => option.food_name ?? ''}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={selectedFood}
          onChange={(event, newValue) => setSelectedFood(newValue)}
          renderInput={(params) => (
            <TextField {...params} label="Buscar alimento" margin="normal" />
          )}
        />

        <TextField
          label="Gramos"
          type="number"
          margin="normal"
          fullWidth
          value={grams}
          onChange={(e) => setGrams(e.target.value)}
        />

        <TextField
          select
          label="Tipo de comida"
          margin="normal"
          fullWidth
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
        >
          {mealTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {mealTypeLabels[type]}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedFood || !grams || !mealType}
        >
          {initialMeal ? 'Guardar Cambios' : 'Agregar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMealModal;