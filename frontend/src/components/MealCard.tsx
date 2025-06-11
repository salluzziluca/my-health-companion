import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, IconButton, Stack, Tooltip, Box, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';
import { Meal } from '../types/Meal';
import { getMealNutrition } from '../services/api';

interface Props {
  meal: Meal;
  onDelete: (id: number) => void;
  onEdit: (meal: Meal) => void;
}

const NutrientTooltip = ({ mealId }: { mealId: number }) => {
  const [nutrition, setNutrition] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNutrition = async () => {
    try {
      setLoading(true);
      const data = await getMealNutrition(mealId);
      setNutrition(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar la información nutricional');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutrition();
  }, [mealId]);

  if (loading) {
    return <CircularProgress size={24} />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!nutrition) {
    return <Typography>Pase el mouse para ver la información nutricional</Typography>;
  }

  return (
    <Box sx={{ p: 2, minWidth: 300 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'success.main' }}>
        Macronutrientes
      </Typography>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
          Proteínas:
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
          {nutrition.total_macros.protein_g.toFixed(1)}g
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
          Carbohidratos:
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
          {nutrition.total_macros.carbs_g.toFixed(1)}g
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
          Grasas:
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
          {nutrition.total_macros.fat_g.toFixed(1)}g
        </Typography>
      </Stack>

      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'success.main' }}>
        Micronutrientes
      </Typography>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
          Hierro:
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
          {nutrition.total_micros.iron_mg.toFixed(1)}mg
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
          Vitamina C:
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
          {nutrition.total_micros.vitamin_c_mg.toFixed(1)}mg
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
          Calcio:
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
          {nutrition.total_micros.calcium_mg.toFixed(1)}mg
        </Typography>
      </Stack>
    </Box>
  );
};

const MealCard: React.FC<Props> = ({ meal, onDelete, onEdit }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography>{meal.meal_name} — {Math.round(meal.calories)} cal</Typography>
            <Tooltip
              title={<NutrientTooltip mealId={meal.id} />}
              placement="right"
              enterDelay={0}
              leaveDelay={0}
              componentsProps={{
                tooltip: {
                  sx: {
                    fontSize: '1rem',
                    maxWidth: 'none',
                    bgcolor: 'white',
                    color: 'text.primary',
                    boxShadow: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    position: 'absolute',
                    top: '-50%',
                    transform: 'translateY(-50%)',
                  },
                },
                popper: {
                  sx: {
                    '&[data-popper-placement*="right"]': {
                      marginLeft: '8px !important',
                    },
                  },
                  modifiers: [
                    {
                      name: 'preventOverflow',
                      enabled: true,
                      options: {
                        altAxis: true,
                        padding: 8,
                      },
                    },
                  ],
                },
              }}
            >
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={() => onEdit(meal)} color="primary">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => onDelete(meal.id)} color="error">
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MealCard;