import React from 'react';
import { Card, CardContent, Typography, IconButton, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

type Meal = {
  id: number;
  name: string;
  calories: number;
};

interface Props {
  meal: Meal;
  onDelete: (id: number) => void;
}

const MealCard: React.FC<Props> = ({ meal, onDelete }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography>{meal.name} — {meal.calories} cal</Typography>
          <IconButton onClick={() => onDelete(meal.id)} color="error">
            <DeleteIcon />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MealCard;
