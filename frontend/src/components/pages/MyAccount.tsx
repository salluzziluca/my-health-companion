import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, Stack, TextField } from '@mui/material';
import axios from 'axios';

const MyAccount = () => {
  const [account, setAccount] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: '',
  });

const fetchAccount = async () => {
  try {
    const token = localStorage.getItem('token'); // O donde guardes tu token
    const { data } = await axios.get('http://localhost:8000/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Datos de cuenta:', data);
    setAccount(data);
  } catch (error) {
    console.error('Error fetching account data', error);
  }
};

  useEffect(() => {
    fetchAccount();
  }, []);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Stack spacing={3} alignItems="center">
        <Avatar sx={{ width: 100, height: 100 }} />
        <Typography variant="h5">Información de la Cuenta</Typography>
        <TextField label="Nombre" value={account.first_name} fullWidth disabled />
        <TextField label="Apellido" value={account.last_name} fullWidth disabled />
        <TextField label="Email" value={account.email} fullWidth disabled />
        <TextField label="Rol" value={account.role} fullWidth disabled />
      </Stack>
    </Box>
  );
};

export default MyAccount;
