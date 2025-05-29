import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItemButton, ListItemText, Button } from '@mui/material';
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
  const [professionalId, setProfessionalId] = useState<string>('1'); // ⚠️ Reemplazar con valor real desde contexto
  const [creatingDiet, setCreatingDiet] = useState<boolean>(false);
  const [refreshDiets, setRefreshDiets] = useState<boolean>(false);
  const [refreshMeals, setRefreshMeals] = useState<boolean>(false); // 🆕 Para actualizar seguimiento

  useEffect(() => {
    axios.get('/professionals/my-patients')
      .then(res => setPatients(res.data))
      .catch(console.error);
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>Panel del Nutricionista</Typography>

      <Typography variant="h6">Pacientes asignados</Typography>
      {patients.length === 0 ? (
        <Typography>No tenés pacientes asignados.</Typography>
      ) : (
        <List>
          {patients.map((p) => (
            <ListItemButton key={p.id} onClick={() => {
              setSelectedPatient(p);
              setSelectedDietId(null);
              setCreatingDiet(false);
              setRefreshMeals(prev => !prev); // 🆕 Actualiza seguimiento al cambiar de paciente
            }}>
              <ListItemText primary={`${p.first_name} ${p.last_name}`} />
            </ListItemButton>
          ))}
        </List>
      )}

      {selectedPatient && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Dietas del paciente: {selectedPatient.first_name} {selectedPatient.last_name}
          </Typography>

          {!creatingDiet && (
            <Button
              variant="outlined"
              onClick={() => setCreatingDiet(true)}
              sx={{ mb: 2 }}
            >
              Crear nueva dieta
            </Button>
          )}

          {creatingDiet && (
            <Box mt={2}>
              <CrearDieta
                patientId={selectedPatient.id}
                professionalId={professionalId}
                onFinish={() => {
                  setCreatingDiet(false);
                  setRefreshDiets(prev => !prev);
                  setRefreshMeals(prev => !prev); // 🆕 Refresca comidas creadas
                }}
              />
            </Box>
          )}

          <Box mt={4}>
            <DietasAsignadas
              professionalId={professionalId}
              patientId={selectedPatient.id}
              onSelectDiet={(dietId) => {
                setSelectedDietId(dietId);
                setRefreshMeals(prev => !prev); // 🆕 Actualiza comidas al seleccionar
              }}
              triggerRefresh={refreshDiets}
            />
          </Box>

          {selectedDietId && (
            <Box mt={4}>
              <SeguimientoDieta dietId={selectedDietId} triggerRefresh={refreshMeals} />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default NutricionistaDashboard;
