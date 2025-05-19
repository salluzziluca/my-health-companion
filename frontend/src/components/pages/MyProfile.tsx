import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, TextField, Button, Stack, MenuItem, CircularProgress } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface JwtPayload {
  sub: string;
  user_type?: string;
  type?: string;
  role?: string;
  exp: number;
  [key: string]: any;
}

// Función para obtener el tipo de usuario del token
const getUserTypeFromToken = (): string | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decoded = jwtDecode<JwtPayload>(token);
    console.log('Token decodificado en MyProfile:', decoded);

    // Intentamos diferentes campos que podrían contener el tipo de usuario
    return decoded.user_type || decoded.type || decoded.role || null;
  } catch (error) {
    console.error('Error decodificando el token:', error);
    return null;
  }
};

const MyProfile = () => {
  const [profile, setProfile] = useState({
    weight: '',
    height: '',
    birth_date: '',
    gender: '',
  });

  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(true);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const userType = getUserTypeFromToken();
      console.log('Tipo de usuario en MyProfile:', userType);

      // El endpoint para obtener el perfil puede variar según el tipo de usuario
      // Si es necesario, ajusta la URL según tu API
      const { data } = await axios.get('http://localhost:8000/profiles/me', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      console.log('Datos del perfil recibidos:', data);

      // Verificar si el perfil existe
      if (data && data.weight !== undefined && data.height !== undefined) {
        setProfile({
          weight: data.weight ? data.weight.toString() : '',
          height: data.height ? data.height.toString() : '',
          birth_date: data.birth_date || '',
          gender: data.gender || '',
        });
        setProfileExists(true);
      } else {
        // Si el perfil no existe, mostrar una indicación
        setProfileExists(false);
      }
    } catch (error) {
      console.error('Error fetching profile', error);
      setProfileExists(false); // Si ocurre un error, asumimos que no hay perfil
      setError('Error al cargar el perfil. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        weight: parseFloat(profile.weight),
        height: parseFloat(profile.height),
        birth_date: profile.birth_date,
        gender: profile.gender,
      };

      console.log('Enviando payload de actualización del perfil:', payload);

      await axios.patch('http://localhost:8000/profiles/me', payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

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
        />
        <TextField
          label="Altura (cm)"
          name="height"
          value={profile.height}
          onChange={handleChange}
          fullWidth
          type="number"
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
