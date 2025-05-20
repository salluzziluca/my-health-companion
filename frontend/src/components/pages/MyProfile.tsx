import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, TextField, Button, Stack, MenuItem, CircularProgress, Card, CardContent, Alert } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { healthService } from '../../services/api';
import { WeightHistory } from '../../types/health';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLocation } from 'react-router-dom';

interface JwtPayload {
  sub: string;
  user_type?: string;
  type?: string;
  role?: string;
  exp: number;
  [key: string]: any;
}

const MyProfile = () => {
  const location = useLocation();
  const [profile, setProfile] = useState({
    height: '',
    birth_date: '',
    gender: '',
  });

  const [currentWeight, setCurrentWeight] = useState<string>('');
  const [weightHistory, setWeightHistory] = useState<WeightHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const checkUserRole = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        const role = decoded.role || decoded.user_type || decoded.type;
        setUserRole(role || null);
        return role === 'professional';
      } catch (error) {
        console.error('Error decodificando token', error);
        setError('Error al verificar el rol del usuario');
        return false;
      }
    }
    return false;
  };

  const fetchWeightHistory = async () => {
    try {
      const weightHistoryData = await healthService.getWeightHistory();
      console.log('Weight History Data:', weightHistoryData);

      const transformedData = weightHistoryData.map(log => ({
        date: new Date(log.timestamp).toLocaleDateString(),
        weight: log.weight,
        timestamp: log.timestamp
      }));

      // Guardamos los datos en orden cronológico inverso (más reciente primero)
      setWeightHistory(transformedData);

      // Obtener el peso más reciente (del primer elemento)
      if (transformedData.length > 0) {
        const latestWeight = transformedData[0].weight.toString();
        console.log('Latest Weight:', latestWeight);
        setCurrentWeight(latestWeight);
      } else {
        setCurrentWeight('');
      }
    } catch (error) {
      console.error('Error fetching weight history:', error);
      setError('Error al cargar el historial de peso');
      setCurrentWeight('');
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      // Verificar el rol del usuario
      const isProfessional = checkUserRole();
      if (isProfessional) {
        setLoading(false);
        setProfileExists(false);
        return;
      }

      // Obtener el historial de peso primero
      await fetchWeightHistory();

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('http://localhost:8000/patients/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener el perfil: ${response.status}`);
      }

      const data = await response.json();
      console.log('Profile Data:', data);

      // Si el perfil existe, actualizamos el estado con todos los datos
      if (data) {
        // Formatear la fecha de nacimiento si existe
        const birthDate = data.birth_date
          ? new Date(data.birth_date).toISOString().split('T')[0]
          : '';

        setProfile({
          height: data.height ? data.height.toString() : '',
          birth_date: birthDate,
          gender: data.gender || '',
        });
        setProfileExists(true);
      } else {
        setProfile({
          height: '',
          birth_date: '',
          gender: '',
        });
        setProfileExists(false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar el perfil');
      setProfileExists(false);
      setProfile({
        height: '',
        birth_date: '',
        gender: '',
      });
    } finally {
      setLoading(false);
    }
  };

  // Recargar datos cuando cambia la ruta o la ventana recibe el foco
  useEffect(() => {
    console.log('Route changed or component mounted, fetching profile...');
    fetchProfile();

    const handleFocus = () => {
      console.log('Window focused, reloading profile...');
      fetchProfile();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [location.pathname]); // Añadido location.pathname como dependencia

  const handleSave = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const payload = {
        height: parseFloat(profile.height) || 0,
        birth_date: profile.birth_date || null,
        gender: profile.gender || null,
      };

      console.log('Saving profile with payload:', payload);

      const response = await fetch('http://localhost:8000/patients/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error al guardar el perfil: ${response.status}`);
      }

      setProfileExists(true);
      await fetchProfile();
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar el perfil');
      alert('Error al actualizar el perfil');
    }
  };

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
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (userRole === 'professional') {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
        <Typography variant="h5" align="center">
          Esta sección está disponible solo para pacientes. Como profesional, no tiene un perfil de salud.
        </Typography>
      </Box>
    );
  }

  if (!profileExists) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
        <Card>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <Avatar sx={{ width: 100, height: 100 }} />
              <Typography variant="h5">Crear Perfil</Typography>
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Peso Actual
                </Typography>
                <Typography variant="h4" sx={{ my: 1 }}>
                  {currentWeight ? `${currentWeight} kg` : 'No registrado'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  El peso se actualiza automáticamente desde el Dashboard
                </Typography>
              </Box>
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
                Crear Perfil
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <Avatar sx={{ width: 100, height: 100 }} />
              <Typography variant="h5">Mi Perfil</Typography>
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Peso Actual
                </Typography>
                <Typography variant="h4" sx={{ my: 1 }}>
                  {currentWeight ? `${currentWeight} kg` : 'No registrado'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  El peso se actualiza automáticamente desde el Dashboard
                </Typography>
              </Box>
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
          </CardContent>
        </Card>

        {/* Weight History Chart */}
        {weightHistory.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Historial de Peso
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[...weightHistory].reverse()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
};

export default MyProfile;
