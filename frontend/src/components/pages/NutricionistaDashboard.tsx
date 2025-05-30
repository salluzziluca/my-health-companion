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
  ListItemSecondaryAction
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import axios from '../../services/axiosConfig';
import CrearDieta from './CreateDiet';
import DietasAsignadas from '../AssignedDiets';
import SeguimientoDieta from '../DietFollowUp';

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
  const [creatingDiet, setCreatingDiet] = useState<boolean>(false);
  const [refreshDiets, setRefreshDiets] = useState<boolean>(false);
  const [refreshMeals, setRefreshMeals] = useState<boolean>(false);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const theme = useTheme();

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
      setCreatingDiet(false);
    } else {
      setExpandedPatient(patient.id);
      setSelectedPatient(patient);
      setSelectedDietId(null);
      setCreatingDiet(false);
      setRefreshMeals(prev => !prev);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          mb: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <RestaurantIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" component="h1" color="primary">
            Panel del Nutricionista
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
          Pacientes asignados
        </Typography>

        {patients.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            No tenés pacientes asignados.
          </Typography>
        ) : (
          <List sx={{ py: 0 }}>
            {patients.map((patient, index) => (
              <React.Fragment key={patient.id}>
                <ListItemButton
                  onClick={() => handlePatientClick(patient)}
                  sx={{
                    py: 2,
                    px: 2,
                    borderRadius: 1,
                    mb: 1,
                    backgroundColor: expandedPatient === patient.id ? 
                      theme.palette.primary.light + '20' : 
                      theme.palette.background.default,
                    '&:hover': { 
                      backgroundColor: theme.palette.action.hover
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {patient.first_name} {patient.last_name}
                      </Typography>
                    }
                    secondary={patient.email}
                  />
                  <ListItemSecondaryAction>
                    {expandedPatient === patient.id ? <ExpandLess /> : <ExpandMore />}
                  </ListItemSecondaryAction>
                </ListItemButton>

                <Collapse in={expandedPatient === patient.id} timeout="auto" unmountOnExit>
                  <Box sx={{ pl: 4, pr: 2, py: 2 }}>
                    {!creatingDiet ? (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreatingDiet(true)}
                        sx={{ 
                          mb: 3,
                          borderRadius: 2,
                          textTransform: 'none'
                        }}
                      >
                        Crear nueva dieta
                      </Button>
                    ) : (
                      <Box sx={{ mb: 3 }}>
                        <CrearDieta
                          patientId={patient.id}
                          professionalId={professionalId}
                          onFinish={() => {
                            setCreatingDiet(false);
                            setRefreshDiets(prev => !prev);
                            setRefreshMeals(prev => !prev);
                          }}
                        />
                      </Box>
                    )}

                    <DietasAsignadas
                      professionalId={professionalId}
                      patientId={patient.id}
                      onSelectDiet={(dietId) => {
                        setSelectedDietId(dietId);
                        setRefreshMeals(prev => !prev);
                      }}
                      triggerRefresh={refreshDiets}
                    />

                    {expandedPatient === patient.id && selectedDietId && (
                      <Box sx={{ mt: 3 }}>
                        <SeguimientoDieta 
                          dietId={selectedDietId} 
                          triggerRefresh={refreshMeals} 
                        />
                      </Box>
                    )}
                  </Box>
                </Collapse>

                {index < patients.length - 1 && (
                  <Divider variant="inset" component="li" sx={{ my: 0.5 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default NutricionistaDashboard;
