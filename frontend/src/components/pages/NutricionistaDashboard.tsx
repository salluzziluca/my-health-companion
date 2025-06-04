import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItemButton, 
  ListItemText, 
  Button,
  Paper,
  Chip,
  useTheme,
  Divider,
  IconButton,
  Collapse,
  Avatar,
  ListItemAvatar,
  ListItemSecondaryAction,
  Stack,
  Alert
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axios from '../../services/axiosConfig';
import CrearDieta from './CreateDiet';
import DietasAsignadas from '../AssignedDiets';
import SeguimientoDieta from '../DietFollowUp';
import GoalManagement from '../GoalManagement';
import { useNavigate } from 'react-router-dom';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
}

const NutricionistaDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDietId, setSelectedDietId] = useState<number | null>(null);
  const [professionalId, setProfessionalId] = useState<string>('1');
  const [showingDiets, setShowingDiets] = useState<boolean>(false);
  const [creatingDiet, setCreatingDiet] = useState<boolean>(false);
  const [managingGoals, setManagingGoals] = useState<boolean>(false);
  const [refreshDiets, setRefreshDiets] = useState<boolean>(false);
  const [refreshMeals, setRefreshMeals] = useState<boolean>(false);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/professionals/my-patients')
      .then(res => setPatients(res.data))
      .catch(console.error);
  }, []);

  const handlePatientClick = (patient: Patient) => {
    if (expandedPatient === patient.id) {
      setExpandedPatient(null);
      setSelectedPatient(null);
      setSelectedDietId(null);
      setShowingDiets(false);
      setCreatingDiet(false);
      setManagingGoals(false);
    } else {
      setExpandedPatient(patient.id);
      setSelectedPatient(patient);
      setSelectedDietId(null);
      setShowingDiets(false);
      setCreatingDiet(false);
      setManagingGoals(false);
      setRefreshMeals(prev => !prev);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {patients.length > 0 && (
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Lista de Pacientes Asignados
        </Typography>
      )}

      {patients.length === 0 ? (
        <Alert severity="info">
          No tienes pacientes asignados. Comparte tu código de vinculación con tus pacientes para que puedan unirse.
        </Alert>
      ) : (
        <List>
          {patients.map((patient) => (
            <React.Fragment key={patient.id}>
              <Paper 
                elevation={0} 
                sx={{ 
                  mb: 2, 
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: 'hidden'
                }}
              >
                <ListItemButton
                  onClick={() => handlePatientClick(patient)}
                  sx={{
                    py: 2,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${patient.first_name} ${patient.last_name}`}
                    secondary={patient.email}
                    primaryTypographyProps={{
                      variant: 'h6',
                      sx: { fontWeight: 600 }
                    }}
                  />
                  {expandedPatient === patient.id ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>

                <Collapse in={expandedPatient === patient.id} timeout="auto" unmountOnExit>
                  <Box sx={{ pl: 4, pr: 2, py: 2 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                      <Button
                        variant="contained"
                        startIcon={<RestaurantIcon />}
                        onClick={() => {
                          setShowingDiets(true);
                          setCreatingDiet(false);
                          setManagingGoals(false);
                        }}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          boxShadow: 'none',
                          '&:hover': { boxShadow: 2 }
                        }}
                      >
                        Gestionar Dietas
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<TrendingUpIcon />}
                        onClick={() => {
                          setManagingGoals(true);
                          setShowingDiets(false);
                          setCreatingDiet(false);
                        }}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          boxShadow: 'none',
                          '&:hover': { boxShadow: 2 }
                        }}
                      >
                        Gestionar Objetivos
                      </Button>
                    </Stack>

                    {showingDiets && (
                      <Box sx={{ mb: 3 }}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              Dietas Asignadas
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => {
                                setCreatingDiet(true);
                                setShowingDiets(false);
                              }}
                              sx={{ 
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                boxShadow: 'none',
                                '&:hover': { boxShadow: 2 }
                              }}
                            >
                              Nueva Dieta
                            </Button>
                          </Stack>
                          <DietasAsignadas
                            professionalId={professionalId}
                            patientId={patient.id}
                            onSelectDiet={(dietId) => {
                              setSelectedDietId(dietId);
                              setRefreshMeals(prev => !prev);
                            }}
                            triggerRefresh={refreshDiets}
                          />
                        </Paper>
                      </Box>
                    )}

                    {creatingDiet && (
                      <Box sx={{ mb: 3 }}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              Crear Nueva Dieta
                            </Typography>
                            <Button
                              variant="outlined"
                              onClick={() => {
                                setCreatingDiet(false);
                                setShowingDiets(true);
                              }}
                              sx={{ 
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': { boxShadow: 1 }
                              }}
                            >
                              Volver a Dietas
                            </Button>
                          </Stack>
                          <CrearDieta
                            patientId={patient.id}
                            professionalId={professionalId}
                            onFinish={() => {
                              setCreatingDiet(false);
                              setShowingDiets(true);
                              setRefreshDiets(prev => !prev);
                              setRefreshMeals(prev => !prev);
                            }}
                          />
                        </Paper>
                      </Box>
                    )}

                    {managingGoals && (
                      <Box sx={{ mb: 3 }}>
                        <GoalManagement patientId={parseInt(patient.id)} />
                      </Box>
                    )}

                    {expandedPatient === patient.id && selectedDietId && !creatingDiet && !showingDiets && (
                      <Box sx={{ mt: 3 }}>
                        <SeguimientoDieta 
                          dietId={selectedDietId} 
                          triggerRefresh={refreshMeals} 
                        />
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default NutricionistaDashboard;
