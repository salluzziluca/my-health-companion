import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  Paper,
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import axios from '../services/axiosConfig';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import RestaurantIcon from '@mui/icons-material/Restaurant';

interface Props {
  dietId: number;
  triggerRefresh?: boolean;
}

interface Food {
  id: number;
  name: string;
  calories: number;
  // otros campos que puedan ser necesarios
}

interface DietMeal {
  id: number;
  meal_name: string;
  completed: boolean;
  meal_of_the_day: string;
  food_id: number;
  food: Food;
  weekly_diet_id: number;
  day_of_week: string;
  calories: number;
}

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
};

const mealTypeIcons: Record<string, React.ReactNode> = {
  breakfast: '🍳',
  lunch: '🍽️',
  dinner: '🌙',
  snack: '🍎',
};

const SeguimientoDieta: React.FC<Props> = ({ dietId, triggerRefresh }) => {
  const [meals, setMeals] = useState<DietMeal[]>([]);
  const theme = useTheme();

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await axios.get(`/weekly-diets/${dietId}/meals?include_status=true`);
        setMeals(response.data);
      } catch (err) {
        console.error('Error al cargar comidas de la dieta', err);
      }
    };

    fetchMeals();
  }, [dietId, triggerRefresh]);

  // Agrupar comidas por día
  const mealsByDay = meals.reduce((acc, meal) => {
    if (!acc[meal.day_of_week]) {
      acc[meal.day_of_week] = [];
    }
    acc[meal.day_of_week].push(meal);
    return acc;
  }, {} as Record<string, DietMeal[]>);

  const dayOrder = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        maxHeight: '600px',
        overflow: 'auto'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <RestaurantIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="h2" color="primary">
          Comidas de la dieta semanal
        </Typography>
      </Box>

      {dayOrder.map(day => {
        const dayMeals = mealsByDay[day] || [];
        if (dayMeals.length === 0) return null;

        return (
          <Box key={day} sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 'bold',
                mb: 1,
                color: 'text.secondary',
                textTransform: 'capitalize'
              }}
            >
              {day}
            </Typography>
            <List sx={{ py: 0 }}>
              {dayMeals.map((meal, index) => (
                <React.Fragment key={meal.id}>
                  <ListItem
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderRadius: 1,
                      mb: 0.5,
                      backgroundColor: meal.completed ? 
                        theme.palette.success.light + '20' : 
                        theme.palette.background.default,
                      '&:hover': {
                        backgroundColor: meal.completed ? 
                          theme.palette.success.light + '30' : 
                          theme.palette.action.hover,
                      },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" component="span">
                            {mealTypeIcons[meal.meal_of_the_day]} {meal.meal_name}
                          </Typography>
                          <Chip
                            size="small"
                            label={mealTypeLabels[meal.meal_of_the_day]}
                            sx={{ 
                              ml: 1,
                              backgroundColor: theme.palette.primary.light + '40',
                              color: theme.palette.primary.main,
                              fontWeight: 'medium'
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          {meal.completed ? (
                            <Chip
                              icon={<CheckCircleOutlineIcon />}
                              label="Completada"
                              size="small"
                              color="success"
                              sx={{ fontWeight: 'medium' }}
                            />
                          ) : (
                            <Chip
                              icon={<CancelOutlinedIcon />}
                              label="Pendiente"
                              size="small"
                              color="error"
                              sx={{ fontWeight: 'medium' }}
                            />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < dayMeals.length - 1 && (
                    <Divider variant="inset" component="li" sx={{ my: 0.5 }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          </Box>
        );
      })}
    </Paper>
  );
};

export default SeguimientoDieta;
