import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import axios from '../services/axiosConfig';

interface Props {
  dietId: number;
  patientId?: string;
  triggerRefresh: boolean;
}

interface DietMeal {
  id: number;
  meal_name: string;
  calories: number;
  completed: boolean; // Cambiado de is_completed
  meal_of_the_day: string;
}


const SeguimientoDieta: React.FC<Props> = ({ dietId, triggerRefresh }) => {
  const [meals, setMeals] = useState<DietMeal[]>([]);

  useEffect(() => {
    axios.get(`/weekly-diets/${dietId}/meals?include_status=true`)
      .then(res => setMeals(res.data))
      .catch(err => console.error('Error al cargar comidas de la dieta', err));
  }, [dietId, triggerRefresh]);

  return (
    <Box>
      <Typography variant="h6">Comidas de la dieta semanal</Typography>
      <List>
        {meals.map(meal => (
          <ListItem key={meal.id}>
            <ListItemText
              primary={`${meal.meal_name} (${meal.meal_of_the_day})`}
              secondary={`Calorías: ${meal.calories} - ${meal.completed ? '✅ Completada' : '❌ No completada'}`}

            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default SeguimientoDieta;
