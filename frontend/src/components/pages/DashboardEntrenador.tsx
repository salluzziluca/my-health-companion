import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper, Stack, Divider, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, Select, MenuItem
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EditIcon from '@mui/icons-material/Edit';
import WaterDashboard from '../WaterDashboard';
import { useTheme } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Tooltip from '@mui/material/Tooltip';

const MOCK_PROGRESO = [
  { date: '2025-06-09', minutos: 45 },
  { date: '2025-06-10', minutos: 60 },
  { date: '2025-06-11', minutos: 30 },
  { date: '2025-06-12', minutos: 50 },
  { date: '2025-06-13', minutos: 40 },
  { date: '2025-06-14', minutos: 0 },
  { date: '2025-06-15', minutos: 70 },
];
const MOCK_CALORIAS = [
  { date: '2025-06-09', calorias: 350 },
  { date: '2025-06-10', calorias: 420 },
  { date: '2025-06-11', calorias: 200 },
  { date: '2025-06-12', calorias: 380 },
  { date: '2025-06-13', calorias: 300 },
  { date: '2025-06-14', calorias: 0 },
  { date: '2025-06-15', calorias: 500 },
];
const MOCK_RUTINA = [
  { dia: 'Lunes', rutina: 'Tren superior' },
  { dia: 'Martes', rutina: 'Piernas' },
  { dia: 'Miércoles', rutina: 'Cardio' },
  { dia: 'Jueves', rutina: 'Tren inferior' },
  { dia: 'Viernes', rutina: 'Full body' },
  { dia: 'Sábado', rutina: 'Descanso' },
  { dia: 'Domingo', rutina: 'Descanso' },
];
const MOCK_FAVORITOS = ['Sentadillas', 'Dominadas', 'Press banca'];
const MOCK_OBJETIVOS = [
  'Perder grasa',
  'Ganar masa muscular',
  'Mejorar resistencia',
  'Aumentar flexibilidad',
];

const DashboardEntrenador = () => {
  const theme = useTheme();
  const [nuevoPR, setNuevoPR] = useState('');
  const [nota, setNota] = useState('¡Gran semana! Seguí así.');
  const [isNotaDialogOpen, setIsNotaDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(0);

  // Mock de rango de fechas
  const rango = '2025-06-09 – 2025-06-15';

  // Cálculos mock
  const totalMin = MOCK_PROGRESO.reduce((a, b) => a + b.minutos, 0);
  const diasEntrenados = MOCK_PROGRESO.filter(d => d.minutos > 0).length;
  const promedio = Math.round(totalMin / 7);
  const horaFrecuente = '18:00';

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 1200, mx: 'auto', width: '100%' }}>
      {/* Cabecera */}
      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 3, background: `linear-gradient(90deg, ${theme.palette.primary.light}10 0%, ${theme.palette.secondary.light}10 100%)`, border: `1px solid ${theme.palette.divider}` }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '-1px', mb: 0.5 }}>
              Mi semana de entrenamiento
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 400 }}>
              {rango}
            </Typography>
          </Box>
          
        </Stack>
      </Paper>

      {/* Progreso de Entrenamiento */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '-0.5px', mb: 2 }}>
          Progreso de Entrenamiento
        </Typography>
        <Box sx={{ height: 280, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_PROGRESO} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} opacity={0.5} />
              <XAxis dataKey="date" stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} tickLine={false} axisLine={{ stroke: theme.palette.divider }} tickFormatter={value => format(new Date(value), 'EEE d', { locale: es })} />
              <YAxis stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} tickLine={false} axisLine={{ stroke: theme.palette.divider }} />
              <RechartsTooltip formatter={(value) => [`${value} min`, 'Duración']} labelFormatter={label => format(new Date(label), "EEEE d 'de' MMMM", { locale: es })} />
              <Line type="monotone" dataKey="minutos" stroke={theme.palette.primary.main} strokeWidth={3} dot={{ r: 4, fill: theme.palette.primary.main, stroke: 'white', strokeWidth: 2, opacity: 0.8 }} activeDot={{ r: 6, fill: theme.palette.primary.main, stroke: 'white', strokeWidth: 2 }} isAnimationActive />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Calorías Quemadas */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', minHeight: 340, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '-0.5px', mb: 2 }}>
          Calorías Quemadas
        </Typography>
        <Box sx={{ height: 280, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MOCK_CALORIAS} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} opacity={0.5} />
              <XAxis dataKey="date" stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} tickLine={false} axisLine={{ stroke: theme.palette.divider }} tickFormatter={value => format(new Date(value), 'EEE d', { locale: es })} />
              <YAxis stroke={theme.palette.text.secondary} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} tickLine={false} axisLine={{ stroke: theme.palette.divider }} tickFormatter={value => `${value} cal`} />
              <RechartsTooltip formatter={value => [`${value} cal`, 'Calorías']} labelFormatter={label => format(new Date(label), "EEEE d 'de' MMMM", { locale: es })} />
              <Bar dataKey="calorias" fill={theme.palette.secondary.main} radius={[4, 4, 0, 0]} maxBarSize={60} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">Registra entrenamientos para ver tu progreso de calorías</Typography>
      </Paper>

      {/* Resumen de Entrenamientos */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', minHeight: 200, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Resumen de Entrenamientos</Typography>
        <Stack direction="row" spacing={3} alignItems="center" mb={2}>
          <Chip label={`Total: ${totalMin} min`} color="primary" />
          <Chip label={`Promedio diario: ${promedio} min`} color="secondary" />
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" fullWidth onClick={() => {}} sx={{ borderRadius: 2, fontWeight: 600 }}>Gestionar Entrenamientos</Button>
          <Button variant="outlined" fullWidth onClick={() => {}} sx={{ borderRadius: 2, fontWeight: 600 }}>Gestionar Rutinas Asignadas</Button>
        </Stack>
      </Paper>

      {/* Rutina Actual */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', minHeight: 120, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Rutina Actual</Typography>
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'space-between', alignItems: 'center', mb: 2, overflowX: 'auto' }}>
          {MOCK_RUTINA.map((r, i) => {
            const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            const today = new Date();
            const isToday = i === (today.getDay() === 0 ? 6 : today.getDay() - 1); // Lunes=0, Domingo=6
            return (
              <Tooltip 
                key={r.dia} 
                title={<span style={{ fontSize: 20, fontWeight: 600 }}>{r.rutina}</span>} 
                arrow 
                placement="top"
                componentsProps={{
                  tooltip: {
                    sx: {
                      fontSize: 20,
                      fontWeight: 600,
                      px: 2,
                      py: 1.5,
                      bgcolor: 'white',
                      color: 'primary.main',
                      boxShadow: 3,
                      borderRadius: 2,
                    }
                  }
                }}
              >
                <Box
                  sx={{
                    minWidth: 64,
                    height: 72,
                    bgcolor: isToday ? 'primary.main' : '#f5f5f5',
                    color: isToday ? 'white' : 'primary.main',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    boxShadow: isToday ? 2 : 0,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: isToday ? `2px solid ${theme.palette.primary.dark}` : `1px solid #e0e0e0`,
                    '&:hover': {
                      bgcolor: isToday ? 'primary.dark' : '#e0e0e0',
                      color: isToday ? 'white' : 'primary.main',
                    },
                  }}
                >
                  <span style={{ fontSize: 18, fontWeight: 700 }}>{dayNames[i]}</span>
                </Box>
              </Tooltip>
            );
          })}
        </Box>
        <Button variant="contained" sx={{ mt: 2, borderRadius: 2, fontWeight: 600 }}>Ver detalle de rutina</Button>
      </Paper>

      {/* Grid 2x2 para los 4 cuadraditos */}
      <Box sx={{ mt: 3, width: '100%' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ width: '100%', alignItems: 'stretch' }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
            {/* Horarios de Entrenamiento */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', minHeight: 200, height: { md: 240 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Horarios de Entrenamiento</Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Hora más frecuente</Typography>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>{horaFrecuente || 'No disponible'}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Total de días entrenados</Typography>
                  <Typography variant="h6" sx={{ mt: 0.5 }}>{diasEntrenados}</Typography>
                </Box>
              </Stack>
            </Paper>
            {/* Objetivos Físicos */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', minHeight: 200, height: { md: 240 }, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', position: 'relative' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>Objetivos Físicos</Typography>
              <Box sx={{ width: '100%', mb: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                  {MOCK_OBJETIVOS.map((obj, i) => (
                    <Chip
                      key={i}
                      label={obj}
                      color="default"
                      variant="outlined"
                      sx={{ fontWeight: 500, fontSize: '1rem', borderRadius: 2, px: 2, width: '100%', justifyContent: 'center' }}
                    />
                  ))}
                </Box>
              </Box>
              <Button variant="contained" sx={{ position: 'absolute', left: '50%', bottom: 24, transform: 'translateX(-50%)', borderRadius: 2, fontWeight: 600, minWidth: 180 }}>Gestionar Objetivos</Button>
            </Paper>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
            {/* Ejercicios Favoritos */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', minHeight: 200, height: { md: 240 }, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1, textAlign: 'left' }}>Ejercicios Favoritos</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'left' }}>¡Tus favoritos para motivarte cada semana!</Typography>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                  {MOCK_FAVORITOS.map((ej, i) => (
                    <Chip
                      key={i}
                      label={ej}
                      color="default"
                      variant="outlined"
                      sx={{ fontWeight: 500, fontSize: '1rem', borderRadius: 2, px: 2, width: '100%', justifyContent: 'center' }}
                    />
                  ))}
                </Box>
              </Box>
            </Paper>
            {/* Nota Semanal del Entrenador */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, background: 'white', minHeight: 200, height: { md: 240 } }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>Nota semanal del entrenador</Typography>
                <IconButton onClick={() => setIsNotaDialogOpen(true)} size="small" sx={{ color: 'primary.main', transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', color: 'white' } }}>
                  <EditIcon />
                </IconButton>
              </Stack>
              <Typography variant="body2" sx={{ color: nota ? 'text.primary' : 'text.secondary', fontStyle: nota ? 'normal' : 'italic', mt: 1 }}>
                {nota || 'No hay notas para esta semana'}
              </Typography>
            </Paper>
          </Box>
        </Stack>
      </Box>

      {/* Dialogo de Nota Semanal */}
      <Dialog open={isNotaDialogOpen} onClose={() => setIsNotaDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Editar Nota Semanal</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={4}
            fullWidth
            value={nota}
            onChange={e => setNota(e.target.value)}
            placeholder="Escribe la nota del entrenador para esta semana..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIsNotaDialogOpen(false)} sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}>Cancelar</Button>
          <Button onClick={() => setIsNotaDialogOpen(false)} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', px: 3, boxShadow: 'none', transition: 'all 0.2s', '&:hover': { boxShadow: 2, transform: 'translateY(-2px)', bgcolor: 'primary.dark' } }}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardEntrenador; 