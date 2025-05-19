import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { healthService } from '../../services/api';
import { WeightLog, WeeklySummary, WeeklyNote } from '../../types/health';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [weight, setWeight] = useState('');
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [weeklyNote, setWeeklyNote] = useState('');
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklySummary = async () => {
    try {
      const summary = await healthService.getWeeklySummary();
      setWeeklySummary(summary);
      if (summary.notes) {
        setWeeklyNote(summary.notes);
      }
    } catch (err) {
      setError('Error al cargar el resumen semanal');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklySummary();
  }, []);

  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    try {
      // Registrar el nuevo peso
      await healthService.logWeight(parseFloat(weight));

      // Actualizar el perfil con el nuevo peso
      const token = localStorage.getItem('token');
      await fetch('http://localhost:8000/patients/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          weight: parseFloat(weight)
        }),
      });

      setWeight('');
      fetchWeeklySummary(); // Refresh the summary
    } catch (err) {
      setError('Error al registrar el peso');
      console.error(err);
    }
  };

  const handleNoteSubmit = async () => {
    if (!weeklySummary) return;

    try {
      await healthService.createOrUpdateWeeklyNote({
        week_start_date: weeklySummary.week_start_date,
        notes: weeklyNote,
      });
      setIsNoteDialogOpen(false);
      fetchWeeklySummary(); // Refresh the summary
    } catch (err) {
      setError('Error al guardar la nota');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, mx: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Weight Logging Section */}
        <Box sx={{ width: { xs: '100%', md: '33%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Registrar Peso
              </Typography>
              <form onSubmit={handleWeightSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="Peso (kg)"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    fullWidth
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled={!weight}
                  >
                    Registrar
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </Box>

        {/* Weekly Summary Section */}
        <Box sx={{ width: { xs: '100%', md: '67%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen Semanal
              </Typography>
              {weeklySummary && (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle1">
                      Período: {weeklySummary.week_start_date} - {weeklySummary.week_end_date}
                    </Typography>
                    <Typography>
                      Cambio de peso: {weeklySummary.weight_data.weight_change} kg
                    </Typography>
                  </Box>

                  {/* Weight Chart */}
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklySummary.weight_data.weight_logs}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="weight" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>

                  {/* Weekly Note */}
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle1">Nota Semanal:</Typography>
                      <IconButton onClick={() => setIsNoteDialogOpen(true)}>
                        <EditIcon />
                      </IconButton>
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {weeklySummary.notes || 'No hay notas para esta semana'}
                    </Typography>
                  </Box>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Weekly Note Dialog */}
      <Dialog open={isNoteDialogOpen} onClose={() => setIsNoteDialogOpen(false)}>
        <DialogTitle>Nota Semanal</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={4}
            value={weeklyNote}
            onChange={(e) => setWeeklyNote(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            inputProps={{ maxLength: 1000 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNoteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleNoteSubmit} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
