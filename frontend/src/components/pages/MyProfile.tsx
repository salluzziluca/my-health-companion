import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, TextField, Button, Stack, MenuItem, CircularProgress } from '@mui/material';
import { authService } from '../../services/api';

const MyProfile = () => {
  const [profile, setProfile] = useState({
    weight: '',
    height: '',
    birth_date: '',
    gender: '',
    first_name: '',
    last_name: '',
    email: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const fetchProfile = async () => {
    try {
      // Obtener el rol del localStorage
      const userRole = localStorage.getItem('role');
      setRole(userRole);

      // Obtener el perfil del usuario según el endpoint correspondiente
      const userData = await authService.getCurrentUser();

      setProfile({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        weight: userData.weight ? userData.weight.toString() : '',
        height: userData.height ? userData.height.toString() : '',
        birth_date: userData.birth_date || '',
        gender: userData.gender || '',
      });
    } catch (error) {
      console.error('Error fetching profile', error);
      setError('Error al cargar el perfil. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        weight: profile.weight ? parseFloat(profile.weight) : undefined,
        height: profile.height ? parseFloat(profile.height) : undefined,
        birth_date: profile.birth_date || undefined,
        gender: profile.gender || undefined,
      };

      await authService.updateCurrentUser(payload);
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar perfil', error);
      setError('Error al actualizar el perfil. Por favor, intenta de nuevo.');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
        <Typography variant="h5" align="center" color="error">
          {error}
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
          label="Nombre"
          name="first_name"
          value={profile.first_name}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="Apellido"
          name="last_name"
          value={profile.last_name}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="Email"
          name="email"
          value={profile.email}
          disabled
          fullWidth
        />

        {role === 'patient' && (
          <>
            <TextField
              label="Peso (kg)"
              name="weight"
              value={profile.weight}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Altura (cm)"
              name="height"
              value={profile.height}
              onChange={handleChange}
              fullWidth
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
            </TextField>
          </>
        )}

        <Button variant="contained" color="primary" onClick={handleSave}>
          Guardar Cambios
        </Button>
      </Stack>
    </Box>
  );
};

export default MyProfile;
