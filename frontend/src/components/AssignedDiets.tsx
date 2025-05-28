// src/components/AssignedDiets.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Typography, List, ListItem, ListItemText, IconButton, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions, Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from '../services/axiosConfig';

interface WeeklyDiet {
  id: number;
  patient_id: string;
  start_date: string;
  professional_id: string;
}

interface Props {
  professionalId: string;
  patientId: string;
  onSelectDiet: (dietId: number | null) => void;
  triggerRefresh?: boolean; // 🆕 nuevo prop opcional para forzar refresco externo
}

const DietasAsignadas: React.FC<Props> = ({ professionalId, patientId, onSelectDiet, triggerRefresh }) => {
  const [diets, setDiets] = useState<WeeklyDiet[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dietToDelete, setDietToDelete] = useState<number | null>(null);

  const fetchDiets = () => {
    axios.get(`/weekly-diets/professional/${professionalId}`)
      .then(res => {
        const filtered = res.data.filter(
          (diet: WeeklyDiet) => diet.patient_id === patientId
        );
        setDiets(filtered);
      })
      .catch(err => console.error('Error al cargar dietas asignadas', err));
  };

  useEffect(() => {
    fetchDiets();
  }, [professionalId, patientId, triggerRefresh]); // 🆕 ahora también escucha el trigger externo

  const handleConfirmDelete = async () => {
    if (!dietToDelete) return;
    try {
      await axios.delete(`/weekly-diets/${dietToDelete}`);
      setDiets(prev => prev.filter(d => d.id !== dietToDelete));
      setOpenDialog(false);
      setDietToDelete(null);
      onSelectDiet(null); // 🆕 Resetea el seguimiento si se está mostrando la dieta borrada
    } catch (err) {
      console.error('Error al eliminar dieta', err);
      alert('No se pudo eliminar la dieta.');
    }
  };

  return (
    <Box>
      <Typography variant="h6">Dietas creadas para el paciente</Typography>
      <List>
        {diets.map(diet => (
          <ListItem
            key={diet.id}
            secondaryAction={
              <IconButton edge="end" onClick={() => {
                setDietToDelete(diet.id);
                setOpenDialog(true);
              }}>
                <DeleteIcon color="error" />
              </IconButton>
            }
            component="button"
            onClick={() => onSelectDiet(diet.id)}
          >
            <ListItemText primary={`Dieta del ${new Date(diet.start_date).toLocaleDateString()}`} />
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Eliminar dieta</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que querés eliminar esta dieta? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DietasAsignadas;
