import React, { useEffect } from 'react';
import axios from '../../services/axiosConfig';
import { useNavigate } from 'react-router-dom';
import PatientList from '../PatientList';

const NutricionistaDashboard: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/professionals/me')
      .then(res => {
        console.log('Datos del profesional:', res.data);
        if (res.data.specialization !== 'nutritionist') {
          alert('Acceso denegado. Solo nutricionistas pueden acceder.');
          navigate('/');
        }
      })
      .catch(() => navigate('/'));
  }, [navigate]);

  return <PatientList />;
};

export default NutricionistaDashboard;