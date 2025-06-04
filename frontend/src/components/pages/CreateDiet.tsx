import React, { useEffect, useState } from 'react';
import {
  Box, TextField, Button, Typography,
  Autocomplete, CircularProgress, MenuItem, List, ListItem, ListItemText, Snackbar, Alert
} from '@mui/material';
import axios from '../../services/axiosConfig';

interface Props {
  patientId: string;
  professionalId: string;
  onFinish: () => void;
}

interface FoodOption {
  id: number;
  food_name: string;
  calories: number;
}

interface PendingMeal {
  food: FoodOption;
  grams: number;
  meal_of_the_day: string;
  day_of_week: string;
}

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
const mealTypeLabels: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
};

const daysOfWeek = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

const CrearDieta: React.FC<Props> = ({ patientId, professionalId, onFinish }) => {
  const [foods, setFoods] = useState<FoodOption[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodOption | null>(null);
  const [mealType, setMealType] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('lunes');
  const [grams, setGrams] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingMeals, setPendingMeals] = useState<PendingMeal[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    setLoading(true);
    axios.get('/foods')
      .then(res => setFoods(res.data))
      .catch(err => console.error('Error al cargar comidas', err))
      .finally(() => setLoading(false));
  }, []);

  const handleAgregarComida = () => {
    if (!selectedFood || !grams || !mealType || !dayOfWeek) return;

    const parsedGrams = parseInt(grams);
    if (isNaN(parsedGrams)) return;

    setPendingMeals(prev => [
      ...prev,
      { food: selectedFood, grams: parsedGrams, meal_of_the_day: mealType, day_of_week: dayOfWeek }
    ]);
    setSelectedFood(null);
    setGrams('');
    setMealType('');
    setDayOfWeek('lunes');
  };

  const handleCrearDieta = async () => {
    if (pendingMeals.length === 0) {
      setSnackbar({ open: true, message: 'Agregá al menos una comida antes de crear la dieta.', severity: 'error' });
      return;
    }

    const week_start_date = new Date().toISOString().split('T')[0];
    let weeklyDietId: number | null = null;

    try {
      const { data } = await axios.post('/weekly-diets/', {}, {
        params: {
          week_start_date,
          patient_id: patientId,
          professional_id: professionalId,
        }
      });
      weeklyDietId = data.id;
      if (!weeklyDietId) {
        console.error('No se recibió un id de dieta semanal en la respuesta:', data);
        setSnackbar({ open: true, message: 'No se pudo crear la dieta. Intenta nuevamente.', severity: 'error' });
        return;
      }
    } catch (error: any) {
      if (error?.response?.status === 400 && error?.response?.data?.detail?.includes("Weekly diet already exists")) {
        setSnackbar({ open: true, message: 'Ya existe una dieta para este paciente en esta semana.', severity: 'error' });
        return;
      }
      console.error('Error al crear la dieta', error);
      setSnackbar({ open: true, message: 'Error al crear la dieta', severity: 'error' });
      return;
    }

    try {
      for (const meal of pendingMeals) {
        await axios.post(`/weekly-diets/${weeklyDietId}/meals`, {}, {
          params: {
            meal_name: `${mealTypeLabels[meal.meal_of_the_day]} ${meal.food.food_name}`,
            day_of_week: meal.day_of_week,
            meal_of_the_day: meal.meal_of_the_day,
            food_id: meal.food.id,
            grams: meal.grams,
          }
        });
      }

      // PROBANDO ENVIO DE MAIL (chequear si esto va aca)
      try {
        await axios.post(`/weekly-diets/${weeklyDietId}/send-diet-email`);
      } catch (error) {
        console.error('Error al enviar el email al paciente', error);
        setSnackbar({ open: true, message: 'Dieta creada, pero falló el envío del email.', severity: 'error' });
        return;
      }
      
      setSnackbar({ open: true, message: 'Dieta creada exitosamente y email enviado al paciente', severity: 'success' });
      onFinish();
    } catch (err) {
      console.error('Error al agregar comidas', err);
      setSnackbar({ open: true, message: 'Error al agregar comidas a la dieta', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>Crear nueva dieta</Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Autocomplete
          options={foods}
          getOptionLabel={(option) => option.food_name ?? ''}
          value={selectedFood}
          onChange={(_, newValue) => setSelectedFood(newValue)}
          renderInput={(params) => <TextField {...params} label="Buscar alimento" margin="normal" fullWidth />}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
      )}

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

      <TextField
        select
        label="Día de la semana"
        margin="normal"
        fullWidth
        value={dayOfWeek}
        onChange={(e) => setDayOfWeek(e.target.value)}
      >
        {daysOfWeek.map((day) => (
          <MenuItem key={day} value={day}>
            {day.charAt(0).toUpperCase() + day.slice(1)}
          </MenuItem>
        ))}
      </TextField>

      <Button
        variant="outlined"
        onClick={handleAgregarComida}
        disabled={!selectedFood || !grams || !mealType || !dayOfWeek}
        sx={{ mt: 2, mr: 1 }}
      >
        Agregar comida
      </Button>

      {pendingMeals.length > 0 && (
        <>
          <Typography variant="h6" mt={3}>Comidas agregadas</Typography>
          <List>
            {pendingMeals.map((meal, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${meal.food.food_name} (${mealTypeLabels[meal.meal_of_the_day]}, ${meal.day_of_week})`}
                  secondary={`Gramos: ${meal.grams} - Calorías: ${meal.food.calories * meal.grams / 100}`}
                />
              </ListItem>
            ))}
          </List>

          <Button
            variant="contained"
            color="primary"
            onClick={handleCrearDieta}
            sx={{ mt: 2 }}
          >
            Crear dieta semanal
          </Button>
        </>
      )}

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          position: 'fixed',
          zIndex: 9999,
          top: '24px !important',
          left: '50% !important',
          transform: 'translateX(-50%) !important'
        }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            minWidth: '300px',
            boxShadow: 3
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CrearDieta;