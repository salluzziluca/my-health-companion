import React from 'react';
import { Card, CardContent, Typography, IconButton, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Meal } from '../types/Meal';

interface Props {
  meal: Meal;
  onDelete: (id: number) => void;
  onEdit: (meal: Meal) => void;
}

const MealCard: React.FC<Props> = ({ meal, onDelete, onEdit }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography>{meal.meal_name} — {meal.calories} cal</Typography>
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