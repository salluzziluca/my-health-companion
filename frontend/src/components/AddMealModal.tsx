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
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (meal: NewMeal) => void;
}

const mealTypes = ['desayuno', 'almuerzo', 'cena', 'snack'];

const AddMealModal: React.FC<Props> = ({ open, onClose, onAdd }) => {
  const [foods, setFoods] = useState<FoodOption[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodOption | null>(null);
  const [grams, setGrams] = useState('');
  const [mealType, setMealType] = useState('');

  useEffect(() => {
    getAllFoods()
      .then(setFoods)
      .catch((err) => console.error('Error cargando foods:', err));
  }, []);

  const handleAdd = () => {
    if (!selectedFood || !grams || !mealType) return;

    const newMeal: NewMeal = {
      food_id: selectedFood.id,
      grams: parseInt(grams),
      meal_type: mealType,
    };

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
          getOptionLabel={(option) => option.name}
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
              {type.charAt(0).toUpperCase() + type.slice(1)}
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
