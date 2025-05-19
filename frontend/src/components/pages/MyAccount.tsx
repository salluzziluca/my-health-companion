import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Stack, TextField, Button, CircularProgress, MenuItem } from '@mui/material';
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

// Función para obtener el tipo de usuario del token
const getUserTypeFromToken = (): string | null => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const decoded = jwtDecode<JwtPayload>(token);
    console.log('Token decodificado en MyAccount:', decoded);

    // Intentamos diferentes campos que podrían contener el tipo de usuario
    return decoded.user_type || decoded.type || decoded.role || null;
  } catch (error) {
    console.error('Error decodificando el token:', error);
    return null;
  }
};

const MyAccount = () => {
  const [account, setAccount] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    specialization: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    specialization: '',
  });

  const fetchAccount = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userType = getUserTypeFromToken();
      console.log('Tipo de usuario en MyAccount:', userType);

      // Determinar el endpoint correcto según el tipo de usuario
      let endpoint = '/users/me'; // Endpoint por defecto

      if (userType === 'patient') {
        endpoint = '/patients/me';
      } else if (userType === 'professional') {
        endpoint = '/professionals/me';
      }

      console.log('Usando endpoint para obtener cuenta:', endpoint);

      const { data } = await axios.get(`http://localhost:8000${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Datos de cuenta recibidos:', data);

      setAccount({
        email: data.email || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        role: userType || '',
        specialization: data.specialization || '',
      });

      setEditData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        specialization: data.specialization || '',
      });
    } catch (error) {
      console.error('Error fetching account data', error);
      setError('Error al cargar los datos de la cuenta. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Restaurar los datos originales
    setEditData({
      first_name: account.first_name,
      last_name: account.last_name,
      specialization: account.specialization,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const userType = getUserTypeFromToken();

      // Determinar el endpoint correcto según el tipo de usuario
      let endpoint = '/users/me'; // Endpoint por defecto

      if (userType === 'patient') {
        endpoint = '/patients/me';
      } else if (userType === 'professional') {
        endpoint = '/professionals/me';
      }

      console.log('Usando endpoint para actualizar cuenta:', endpoint);
      console.log('Datos a actualizar:', editData);

      await axios.patch(`http://localhost:8000${endpoint}`, editData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Actualizar los datos en el estado
      setAccount({
        ...account,
        first_name: editData.first_name,
        last_name: editData.last_name,
        specialization: editData.specialization,
      });

      setIsEditing(false);
      alert('Información de la cuenta actualizada correctamente');
    } catch (error) {
      console.error('Error updating account', error);
      setError('Error al actualizar la información de la cuenta. Por favor, intenta de nuevo.');
    }
  };

  useEffect(() => {
    fetchAccount();
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
        <Typography variant="h5">Información de la Cuenta</Typography>

        <TextField
          label="Nombre"
          name="first_name"
          value={isEditing ? editData.first_name : account.first_name}
          onChange={handleChange}
          fullWidth
          disabled={!isEditing}
        />

        <TextField
          label="Apellido"
          name="last_name"
          value={isEditing ? editData.last_name : account.last_name}
          onChange={handleChange}
          fullWidth
          disabled={!isEditing}
        />

        <TextField
          label="Email"
          value={account.email}
          fullWidth
          disabled
        />

        <TextField
          label="Rol"
          value={account.role === 'patient' ? 'Paciente' :
            account.role === 'professional' ? 'Profesional' :
              account.role}
          fullWidth
          disabled
        />

        {account.role === 'professional' && (
          <TextField
            label="Especialización"
            name="specialization"
            value={isEditing ? editData.specialization : account.specialization}
            onChange={handleChange}
            fullWidth
            disabled={!isEditing}
            select={isEditing}
          >
            <MenuItem value="nutritionist">Nutricionista</MenuItem>
            <MenuItem value="personal trainer">Entrenador Personal</MenuItem>
          </TextField>
        )}

        {isEditing ? (
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              fullWidth
            >
              Guardar
            </Button>
            <Button
              variant="outlined"
              onClick={handleCancel}
              fullWidth
            >
              Cancelar
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleEdit}
            fullWidth
          >
            Editar Información
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default MyAccount;
