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
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import { professionalService } from '../../services/api';
import GoalManagement from '../GoalManagement';
import WaterDashboard from '../WaterDashboard';
import { goalsService, GoalProgress } from '../../services/goals';

interface PatientDetailsData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  height: number;
  weight: number;
  birth_date: string;
  gender: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([]);

  const fetchGoalProgress = async (patientId: number) => {
    try {
      const progress = await goalsService.getPatientGoalsProgress(patientId);
      setGoalProgress(progress);
    } catch (err) {
      console.error('Error fetching goal progress:', err);
    }
  };

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        if (!id) return;
        const data = await professionalService.getPatientDetails(id);
        setPatient(data);
        await fetchGoalProgress(parseInt(id));
      } catch (err) {
        console.error('Error fetching patient details:', err);
        setError('Error al cargar los detalles del paciente');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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

  if (!patient) {
    return (
      <Box sx={{ mt: 4, mx: 2 }}>
        <Alert severity="info">No se encontró el paciente</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/dashboard')}>
          Volver al Dashboard
        </Button>
        <Typography variant="h4">
          {patient.first_name} {patient.last_name}
        </Typography>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="patient details tabs">
          <Tab label="Información Personal" />
          <Tab label="Gestión de Metas" />
          <Tab label="Seguimiento de Hidratación" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Información Personal
                </Typography>
                <Stack spacing={1}>
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
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" gutterBottom>
                  Medidas
                </Typography>
                <Stack spacing={1}>
                  <Typography>
                    <strong>Altura:</strong> {patient.height} cm
                  </Typography>
                  <Typography>
                    <strong>Peso:</strong> {patient.weight} kg
                  </Typography>
                  <Typography>
                    <strong>IMC:</strong> {(patient.weight / Math.pow(patient.height / 100, 2)).toFixed(1)}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <GoalManagement patientId={patient.id} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <WaterDashboard
          waterGoals={goalProgress.filter(g => g.goal.goal_type === 'water')}
          onWaterAdded={() => fetchGoalProgress(patient.id)}
          isPatientView={false}
          patientId={patient.id}
        />
      </TabPanel>
    </Box>
  );
};

export default PatientDetails; 