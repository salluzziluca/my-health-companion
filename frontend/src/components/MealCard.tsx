import React from 'react';
import { Card, CardContent, Typography, IconButton, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Meal } from '../types/Meal'; // ✅ importás el tipo correcto

interface Props {
  meal: Meal;
  onDelete: (id: number) => void;
}

const MealCard: React.FC<Props> = ({ meal, onDelete }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography>{meal.meal_name} — {meal.calories} cal</Typography>
          <IconButton onClick={() => onDelete(meal.id)} color="error">
            <DeleteIcon />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MealCard;
