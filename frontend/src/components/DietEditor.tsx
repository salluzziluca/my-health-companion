import React, { useState } from 'react';
import { TextField, Button, Typography, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

interface Props {
  patientId: string;
}

const getStartOfWeek = (): string => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (domingo) a 6 (sábado)
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // lunes como inicio
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
};

const DietEditor: React.FC<Props> = ({ patientId }) => {
  const [weekStart, setWeekStart] = useState(getStartOfWeek());
  const [dietText, setDietText] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const handleSubmit = async () => {
    try {
      await axios.post('/patients/weekly-notes', {
        patient_id: patientId,
        week_start_date: weekStart,
        notes: dietText,
      });
      setSnackbar({ open: true, message: '✅ Dieta enviada correctamente', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: '❌ Error al enviar la dieta', severity: 'error' });
      console.error(error);
    }
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>Crear dieta semanal</Typography>
      <TextField
        label="Semana que inicia"
        type="date"
        value={weekStart}
        onChange={(e) => setWeekStart(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Dieta (texto libre o JSON)"
        value={dietText}
        onChange={(e) => setDietText(e.target.value)}
        fullWidth
        multiline
        rows={6}
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Guardar dieta
      </Button>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DietEditor;