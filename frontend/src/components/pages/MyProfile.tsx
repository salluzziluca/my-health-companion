import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, TextField, Button, Stack, MenuItem, CircularProgress } from '@mui/material';
import axios from 'axios';

const MyProfile = () => {
  const [profile, setProfile] = useState({
    weight: '',
    height: '',
    birth_date: '',
    gender: '',
  });

  const [loading, setLoading] = useState(true); // Estado de carga
  const [profileExists, setProfileExists] = useState(true); // Para verificar si el perfil existe

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:8000/patients/me', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      // Verificar si el perfil existe
      if (data) {
        setProfile({
          weight: data.weight ? data.weight.toString() : '',
          height: data.height ? data.height.toString() : '',
          birth_date: data.birth_date || '',
          gender: data.gender || '',
        });
      } else {
        // Si el perfil no existe, mostrar una indicación
        setProfileExists(false);
      }
    } catch (error) {
      console.error('Error fetching profile', error);
      setProfileExists(false); // Si ocurre un error, asumimos que no hay perfil
    } finally {
      setLoading(false); // Se detiene el loading después de la petición
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        weight: profile.weight ? parseFloat(profile.weight) : null,
        height: profile.height ? parseFloat(profile.height) : null,
        birth_date: profile.birth_date || null,
        gender: profile.gender || null,
      };

      await axios.patch('http://localhost:8000/patients/me', payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      alert('Perfil actualizado correctamente');
      fetchProfile(); // Refrescar los datos después de la actualización
    } catch (error) {
      console.error('Error al actualizar perfil', error);
      alert('Error al actualizar el perfil');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Si la carga está en progreso, mostrar un CircularProgress
  if (loading) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Si no existe el perfil, no mostrar nada o mostrar un mensaje adecuado
  if (!profileExists) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
        <Typography variant="h5" align="center">
          Aún no tienes un perfil. Crea uno para poder configurarlo.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Stack spacing={3} alignItems="center">
        <Avatar sx={{ width: 100, height: 100 }} />
        <Typography variant="h5">Mi Perfil</Typography>
        <TextField
          label="Peso (kg)"
          name="weight"
          value={profile.weight}
          onChange={handleChange}
          fullWidth
          type="number"
          inputProps={{ min: 0, step: 0.1 }}
        />
        <TextField
          label="Altura (cm)"
          name="height"
          value={profile.height}
          onChange={handleChange}
          fullWidth
          type="number"
          inputProps={{ min: 0, step: 0.1 }}
        />
        <TextField
          label="Fecha de Nacimiento"
          name="birth_date"
          type="date"
          value={profile.birth_date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField
          label="Género"
          name="gender"
          value={profile.gender}
          onChange={handleChange}
          select
          fullWidth
        >
          <MenuItem value="male">Masculino</MenuItem>
          <MenuItem value="female">Femenino</MenuItem>
          <MenuItem value="other">Otro</MenuItem>
          <MenuItem value="prefer not to say">Prefiero no decirlo</MenuItem>
        </TextField>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Guardar Cambios
        </Button>
      </Stack>
    </Box>
  );
};

export default MyProfile;
