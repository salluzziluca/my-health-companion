import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';
import { Meal } from '../../types/Meal';
import api from '../../services/api';

interface NutrientSummary {
  total_macros: {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  total_micros: {
    iron_mg: number;
    vitamin_c_mg: number;
    calcium_mg: number;
  };
  alerts: {
    protein: 'deficit' | 'within range' | 'excess';
    carbs: 'deficit' | 'within range' | 'excess';
    fat: 'deficit' | 'within range' | 'excess';
    iron: 'deficit' | 'within range' | 'excess';
    vitamin_c: 'deficit' | 'within range' | 'excess';
    calcium: 'deficit' | 'within range' | 'excess';
  };
}

const Meals: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [nutrientSummary, setNutrientSummary] = useState<NutrientSummary | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMeals();
  }, [token, navigate]);

  const fetchMeals = async () => {
    try {
      const response = await api.get('/meals/');
      setMeals(response.data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  const handleDelete = async (mealId: number) => {
    try {
      await api.delete(`/meals/${mealId}`);
      fetchMeals();
    } catch (error) {
      console.error('Error deleting meal:', error);
    }
  };

  const handleNutrientInfo = async (meal: Meal) => {
    try {
      const response = await api.get(`/nutrient-summary/${meal.id}`);
      setNutrientSummary(response.data);
      setSelectedMeal(meal);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error fetching nutrient summary:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMeal(null);
    setNutrientSummary(null);
  };

  const getAlertColor = (status: 'deficit' | 'within range' | 'excess') => {
    switch (status) {
      case 'deficit':
        return 'error';
      case 'within range':
        return 'success';
      case 'excess':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mis Comidas
      </Typography>
      <List>
        {meals.map((meal) => (
          <ListItem
            key={meal.id}
            secondaryAction={
              <Box>
                <IconButton
                  edge="end"
                  aria-label="info"
                  onClick={() => handleNutrientInfo(meal)}
                  sx={{ mr: 1 }}
                >
                  <InfoIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(meal.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={meal.meal_name}
              secondary={`${meal.grams}g - ${meal.calories} calorías`}
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Información Nutricional - {selectedMeal?.meal_name}
        </DialogTitle>
        <DialogContent>
          {nutrientSummary && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Macronutrientes
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography>
                  Proteínas: {nutrientSummary.total_macros.protein_g.toFixed(1)}g
                  <Chip
                    label={nutrientSummary.alerts.protein}
                    color={getAlertColor(nutrientSummary.alerts.protein)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography>
                  Carbohidratos: {nutrientSummary.total_macros.carbs_g.toFixed(1)}g
                  <Chip
                    label={nutrientSummary.alerts.carbs}
                    color={getAlertColor(nutrientSummary.alerts.carbs)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography>
                  Grasas: {nutrientSummary.total_macros.fat_g.toFixed(1)}g
                  <Chip
                    label={nutrientSummary.alerts.fat}
                    color={getAlertColor(nutrientSummary.alerts.fat)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>
                Micronutrientes
              </Typography>
              <Box>
                <Typography>
                  Hierro: {nutrientSummary.total_micros.iron_mg.toFixed(1)}mg
                  <Chip
                    label={nutrientSummary.alerts.iron}
                    color={getAlertColor(nutrientSummary.alerts.iron)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography>
                  Vitamina C: {nutrientSummary.total_micros.vitamin_c_mg.toFixed(1)}mg
                  <Chip
                    label={nutrientSummary.alerts.vitamin_c}
                    color={getAlertColor(nutrientSummary.alerts.vitamin_c)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography>
                  Calcio: {nutrientSummary.total_micros.calcium_mg.toFixed(1)}mg
                  <Chip
                    label={nutrientSummary.alerts.calcium}
                    color={getAlertColor(nutrientSummary.alerts.calcium)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Meals; 