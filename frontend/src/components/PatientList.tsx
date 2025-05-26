import React, { useEffect, useState } from 'react';
import axios from '../services/axiosConfig';
import { List, ListItemButton, Typography, Box } from '@mui/material';
import DietEditor from './DietEditor';

interface Patient {
  id: string;
  name: string;
}

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  useEffect(() => {
    axios.get('/professionals/my-patients')
      .then(res => {
        console.log('Pacientes asignados:', res.data);
        setPatients(res.data);
      })
      .catch(console.error);
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Mis pacientes</Typography>
      {patients.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No tenés pacientes asignados.
        </Typography>
      ) : (
        <>
          <List>
            {patients.map((p) => (
              <ListItemButton key={p.id} onClick={() => setSelectedPatient(p.id)}>
                {p.name}
              </ListItemButton>
            ))}
          </List>
          {selectedPatient && (
            <Box mt={4}>
              <DietEditor patientId={selectedPatient} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default PatientList;