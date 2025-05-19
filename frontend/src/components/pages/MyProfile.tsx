import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, TextField, Button, Stack, MenuItem, CircularProgress } from '@mui/material';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  user_type?: string;
  type?: string;
  role?: string;
  exp: number;
  [key: string]: any;
}

const MyProfile = () => {
  const [profile, setProfile] = useState({
    weight: '',
    height: '',
    birth_date: '',
    gender: '',
  });

  const [loading, setLoading] = useState(true); // Estado de carga
  const [profileExists, setProfileExists] = useState(true); // Para verificar si el perfil existe
  const [userRole, setUserRole] = useState<string | null>(null); // Estado para el rol del usuario

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Verificar el rol del usuario desde el token
  const checkUserRole = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const role = decoded.role || decoded.user_type || decoded.type;
        setUserRole(role || null);

        // Si es profesional, no intentamos cargar el perfil
        if (role === 'professional') {
          setLoading(false);
          setProfileExists(false);
          return true; // Es profesional
        }
      } catch (error) {
        console.error('Error decodificando token', error);
      }
    }
    return false; // No es profesional o hubo un error
  };

  const fetchProfile = async () => {
    // Primero verificamos si es un profesional
    if (checkUserRole()) {
      return; // Si es profesional, salimos de la función
    }

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:8000/patients/me', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      // Verificar si el perfil existe
      if (data && data.weight !== undefined && data.height !== undefined) {
        setProfile({
          weight: data.weight ? data.weight.toString() : '',
          height: data.height ? data.height.toString() : '',
          birth_date: data.birth_date || '',
          gender: data.gender || '',
        });
      } else {
        // Si el perfil no existe, mostrar una indicación (o no mostrar nada)
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
        weight: parseFloat(profile.weight),
        height: parseFloat(profile.height),
        birth_date: profile.birth_date,
        gender: profile.gender,
      };
      await axios.patch('http://localhost:8000/patients/me', payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar perfil', error);
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

  // Si es un profesional, mostrar un mensaje especial
  if (userRole === 'professional') {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
        <Typography variant="h5" align="center">
          Esta sección está disponible solo para pacientes. Como profesional, no tiene un perfil de salud.
        </Typography>
      </Box>
    );
  }

  // Si no existe el perfil, mostrar un mensaje adecuado
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
        <Button variant="contained" color="primary" onClick={handleSave}>
          Guardar Cambios
        </Button>
      </Stack>
    </Box>
  );
};

export default MyProfile;
