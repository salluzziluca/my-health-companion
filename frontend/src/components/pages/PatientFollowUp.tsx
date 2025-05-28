import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, CircularProgress, Alert } from '@mui/material';
import axios from '../../services/axiosConfig';

interface Props {
  patientId: string;
}

interface Meal {
  id: number;
  meal_name: string;
  calories: number;
  is_completed: boolean;
}

interface PatientDetail {
  meals: Meal[];
}

const SeguimientoPaciente: React.FC<Props> = ({ patientId }) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    axios.get<PatientDetail>(`/professionals/patient/${patientId}`)
      .then(res => {
        setMeals(res.data.meals || []);
        setError(null);
        console.log('Datos del paciente:', res.data);
      })
      .catch(err => {
        console.error(err);
        setError('No se pudo cargar la información del paciente.');
      })
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>Comidas registradas</Typography>
      {meals.length === 0 ? (
        <Typography>No hay comidas registradas para este paciente.</Typography>
      ) : (
        <List>
          {meals.map(meal => (
            <ListItem key={meal.id}>
              {meal.meal_name} — {meal.calories} cal — {meal.is_completed ? '✅ Completado' : '❌ No completado'}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default SeguimientoPaciente;
