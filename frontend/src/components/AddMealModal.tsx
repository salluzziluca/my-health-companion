import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  MenuItem
} from '@mui/material';
import { NewMeal } from '../types/Meal';
import { getAllFoods } from '../services/foods';

interface FoodOption {
  id: number;
  food_name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (meal: NewMeal) => void;
}

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
};

const AddMealModal: React.FC<Props> = ({ open, onClose, onAdd }) => {
  const [foods, setFoods] = useState<FoodOption[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodOption | null>(null);
  const [grams, setGrams] = useState('');
  const [mealType, setMealType] = useState('');

  useEffect(() => {
    getAllFoods()
      .then((data) => {
        console.log('Foods desde API:', data);
        setFoods(data);
      })
      .catch((err) => console.error('Error cargando foods:', err));
  }, []);

  const handleAdd = () => {
    if (!selectedFood || !grams || !mealType) return;

    const parsedGrams = parseInt(grams);
    if (isNaN(parsedGrams)) {
      console.error('Gramos inválidos:', grams);
      return;
    }

    const newMeal: NewMeal = {
      food_id: selectedFood.id,
      grams: parsedGrams,
      meal_of_the_day: mealType, // ya en inglés
      meal_name: selectedFood.food_name,
      timestamp: new Date().toISOString(),
    };

    console.log('DEBUG payload:', newMeal);
    onAdd(newMeal);
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
      <DialogTitle>Agregar Comida</DialogTitle>
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
          onClick={handleAdd}
          variant="contained"
          disabled={!selectedFood || !grams || !mealType}
        >
          Agregar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMealModal;
