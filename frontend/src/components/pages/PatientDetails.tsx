import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Stack,
} from '@mui/material';
import { professionalService } from '../../services/api';

interface PatientDetails {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  height: number;
  weight: number;
  birth_date: string;
  gender: string;
}

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        if (!id) return;
        const data = await professionalService.getPatientDetails(id);
        setPatient(data);
      } catch (err) {
        console.error('Error fetching patient details:', err);
        setError('Error al cargar los detalles del paciente');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [id]);

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

  if (!patient) {
    return (
      <Box sx={{ mt: 4, mx: 2 }}>
        <Alert severity="info">No se encontró el paciente</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/dashboard')}>
          Volver al Dashboard
        </Button>
        <Typography variant="h4">Detalles del Paciente</Typography>
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Información Personal
              </Typography>
              <Typography>
                <strong>Nombre:</strong> {patient.first_name} {patient.last_name}
              </Typography>
              <Typography>
                <strong>Email:</strong> {patient.email}
              </Typography>
              <Typography>
                <strong>Género:</strong> {patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Femenino' : 'Otro'}
              </Typography>
              <Typography>
                <strong>Fecha de Nacimiento:</strong> {new Date(patient.birth_date).toLocaleDateString()}
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Medidas
              </Typography>
              <Typography>
                <strong>Altura:</strong> {patient.height} cm
              </Typography>
              <Typography>
                <strong>Peso:</strong> {patient.weight} kg
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PatientDetails; 