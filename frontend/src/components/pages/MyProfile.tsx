import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, TextField, Button, Stack, MenuItem, CircularProgress, Card, CardContent, Alert, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { healthService } from '../../services/api';
import { WeightHistory } from '../../types/health';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useLocation } from 'react-router-dom';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { goalsService, GoalProgress } from '../../services/goals';
import { useTheme } from '@mui/material/styles';

interface JwtPayload {
  sub: string;
  user_type?: string;
  type?: string;
  role?: string;
  exp: number;
  [key: string]: any;
}

// Función utilitaria para limpiar mensajes de error
function cleanErrorMessage(msg: string): string {
  return msg.replace(/\s*Value error,?\s*/gi, '').trim();
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
  const [fieldErrors, setFieldErrors] = useState({
    height: '',
    birth_date: '',
    gender: ''
  });
  const [professionalCode, setProfessionalCode] = useState('');
  const [professionalInfo, setProfessionalInfo] = useState<{
    first_name: string;
    last_name: string;
    specialization: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([]);
  const theme = useTheme();

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

  const fetchGoalProgress = async () => {
    try {
      const progress = await goalsService.getMyGoalsProgress();
      setGoalProgress(progress);
    } catch (err) {
      console.error('Error fetching goal progress:', err);
      // No establecer error aquí porque las metas son opcionales
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

      // Obtener información del profesional asignado
      try {
        const professionalResponse = await fetch('http://localhost:8000/patients/my-professional', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (professionalResponse.ok) {
          const professionalData = await professionalResponse.json();
          setProfessionalInfo({
            first_name: professionalData.first_name,
            last_name: professionalData.last_name,
            specialization: professionalData.specialization
          });
        } else {
          setProfessionalInfo(null);
        }
      } catch (error) {
        console.error('Error fetching professional data:', error);
        setProfessionalInfo(null);
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
    fetchGoalProgress();

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
      setFieldErrors({
        height: '',
        birth_date: '',
        gender: ''
      });

      // Validación local de la altura
      const heightValue = parseFloat(profile.height);
      if (isNaN(heightValue)) {
        setFieldErrors(prev => ({ ...prev, height: 'La altura debe ser un número válido' }));
        return;
      }
      if (heightValue <= 0) {
        setFieldErrors(prev => ({ ...prev, height: 'La altura debe ser un valor positivo' }));
        return;
      }
      if (heightValue >= 1000) {
        setFieldErrors(prev => ({ ...prev, height: 'La altura no puede exceder los 3 dígitos' }));
        return;
      }

      // Validación local de la fecha de nacimiento
      if (profile.birth_date) {
        const birthDateValue = new Date(profile.birth_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (birthDateValue > today) {
          setFieldErrors(prev => ({ ...prev, birth_date: 'La fecha de nacimiento no puede ser mayor a hoy' }));
          return;
        }
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const payload = {
        height: heightValue,
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
        const errorData = await response.json();
        if (response.status === 422 && errorData.detail) {
          // Manejar errores de validación
          const validationErrors = errorData.detail;
          if (Array.isArray(validationErrors)) {
            const newFieldErrors = {
              height: '',
              birth_date: '',
              gender: ''
            };

            validationErrors.forEach((error: any) => {
              const field = error.loc[1]; // Obtener el nombre del campo del error
              let errorMessage = error.msg;
              if (typeof errorMessage === 'string') {
                errorMessage = cleanErrorMessage(errorMessage);
              }
              if (field in newFieldErrors) {
                newFieldErrors[field as keyof typeof newFieldErrors] = errorMessage;
              }
            });

            setFieldErrors(newFieldErrors);
            return;
          }
        }
        // Si el error no es de validación de campos, limpiar el mensaje general también
        let errorMsg = `Error al guardar el perfil: ${response.status}`;
        if (errorData.detail && typeof errorData.detail === 'string') {
          errorMsg = cleanErrorMessage(errorData.detail);
        }
        throw new Error(errorMsg);
      }

      setProfileExists(true);
      await fetchProfile();
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar el perfil');
    }
  };

  const handleAssignProfessional = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`http://localhost:8000/patients/assign-professional/${professionalCode}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al vincular con el profesional');
      }

      // Recargar el perfil para actualizar la información
      await fetchProfile();
      setProfessionalCode('');
    } catch (error) {
      console.error('Error assigning professional:', error);
      setError(error instanceof Error ? error.message : 'Error al vincular con el profesional');
    }
  };

  const handleUnassignProfessional = async () => {
    try {
      await healthService.unassignProfessional();
      setProfessionalInfo(null);
      setDeleteDialogOpen(false);
      // Recargar el perfil para asegurar que todo está actualizado
      await fetchProfile();
    } catch (err) {
      console.error('Error al eliminar profesional:', err);
      setError('Error al eliminar el profesional');
    }
  };

  // Obtener metas activas de peso para el gráfico
  const weightGoals = goalProgress.filter(g =>
    g.goal.goal_type === 'weight'
  );

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
                error={!!fieldErrors.height}
                helperText={fieldErrors.height}
              />
              <TextField
                label="Fecha de Nacimiento"
                name="birth_date"
                type="date"
                value={profile.birth_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                error={!!fieldErrors.birth_date}
                helperText={fieldErrors.birth_date}
              />
              <TextField
                label="Género"
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                select
                fullWidth
                error={!!fieldErrors.gender}
                helperText={fieldErrors.gender}
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
                error={!!fieldErrors.height}
                helperText={fieldErrors.height}
              />
              <TextField
                label="Fecha de Nacimiento"
                name="birth_date"
                type="date"
                value={profile.birth_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                error={!!fieldErrors.birth_date}
                helperText={fieldErrors.birth_date}
              />
              <TextField
                label="Género"
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                select
                fullWidth
                error={!!fieldErrors.gender}
                helperText={fieldErrors.gender}
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

        {!professionalInfo && (
          <Card>
            <CardContent>
              <Stack spacing={3} alignItems="center">
                <Typography variant="h6">Vincular Profesional</Typography>
                <TextField
                  label="Código del Profesional"
                  value={professionalCode}
                  onChange={(e) => setProfessionalCode(e.target.value)}
                  fullWidth
                  placeholder="Ingresa el código de vinculación"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAssignProfessional}
                  disabled={!professionalCode}
                >
                  Vincular Profesional
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {professionalInfo && (
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Profesional Asignado</Typography>
                <Box>
                  <Typography variant="subtitle1">
                    {professionalInfo.first_name} {professionalInfo.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {professionalInfo.specialization === 'nutritionist' ? 'Nutricionista' : 'Entrenador Personal'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <IconButton
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{ '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.04)' } }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

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
                    <YAxis
                      domain={(() => {
                        // Obtener el rango de pesos del historial
                        const weights = weightHistory.map(log => log.weight);

                        // Obtener los pesos objetivo de las metas activas
                        const targetWeights = weightGoals
                          .map(goal => goal.goal.target_weight)
                          .filter(weight => weight !== null && weight !== undefined) as number[];

                        // Combinar todos los pesos (actuales + objetivos)
                        const allWeights = [...weights, ...targetWeights];

                        if (allWeights.length === 0) return ['auto', 'auto'];

                        const minWeight = Math.min(...allWeights);
                        const maxWeight = Math.max(...allWeights);

                        // Agregar un margen del 10% arriba y abajo para que el gráfico se vea mejor
                        const margin = (maxWeight - minWeight) * 0.1 || 5; // Mínimo 5kg de margen si todos los pesos son iguales

                        return [
                          Math.max(0, minWeight - margin), // No permitir pesos negativos
                          maxWeight + margin
                        ];
                      })()}
                    />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#8884d8" />
                    {/* Líneas de meta de peso */}
                    {weightGoals.map((goalProgress, index) => (
                      goalProgress.goal.target_weight && (
                        <ReferenceLine
                          key={`weight-goal-${goalProgress.goal.id}`}
                          y={goalProgress.goal.target_weight}
                          stroke={theme.palette.success.main}
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          label={{
                            value: `Meta: ${goalProgress.goal.target_weight}kg`,
                            position: "top",
                            style: { fill: theme.palette.success.main, fontWeight: 600 }
                          }}
                        />
                      )
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        )}
      </Stack>

      {/* Diálogo de confirmación para eliminar profesional */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro que deseas eliminar a tu profesional asignado?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleUnassignProfessional} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyProfile;
