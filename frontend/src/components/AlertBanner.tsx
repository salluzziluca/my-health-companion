import React from 'react';
import { Alert } from '@mui/material';

interface Props {
  totalCalories: number;
  userTarget: number;
}

const AlertBanner: React.FC<Props> = ({ totalCalories, userTarget }) => {
  if (totalCalories < userTarget * 0.5) {
    return <Alert severity="warning">¡Advertencia! Estás comiendo muy poco hoy.</Alert>;
  }
  if (totalCalories > userTarget * 1.5) {
    return <Alert severity="error">¡Advertencia! Calorías muy altas para hoy.</Alert>;
  }
  return null;
};

export default AlertBanner;
