import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Autocomplete
} from '@mui/material';
import { NewMeal } from '../types/Meal';

type Meal = {
  name: string;
  calories: number;
};

const mockFoodList = [
  { name: 'Manzana', calories: 95 },
  { name: 'Banana', calories: 105 },
  { name: 'Arroz', calories: 200 },
  { name: 'Pollo', calories: 250 },
  { name: 'Ensalada', calories: 80 }
  // Este array debería venir de una API en el futuro
];

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (meal: NewMeal) => void;
}

const AddMealModal: React.FC<Props> = ({ open, onClose, onAdd }) => {
  const [selectedFood, setSelectedFood] = useState<{ name: string; calories: number } | null>(null);
  const [customCalories, setCustomCalories] = useState('');

  const handleAdd = () => {
    if (selectedFood) {
      const calories = customCalories ? parseInt(customCalories) : selectedFood.calories;
      onAdd({ name: selectedFood.name, calories });
      onClose();
      setSelectedFood(null);
      setCustomCalories('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Agregar Comida</DialogTitle>
      <DialogContent>
        <Autocomplete
          options={mockFoodList}
          getOptionLabel={(option) => option.name}
          onChange={(event, newValue) => setSelectedFood(newValue)}
          renderInput={(params) => <TextField {...params} label="Buscar alimento" margin="normal" />}
        />
        <TextField
          label="Calorías (opcional)"
          type="number"
          margin="normal"
          fullWidth
          value={customCalories}
          onChange={(e) => setCustomCalories(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleAdd} variant="contained" disabled={!selectedFood}>
          Agregar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMealModal;
