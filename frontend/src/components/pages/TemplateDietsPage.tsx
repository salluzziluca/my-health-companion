import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import TemplateDietManager from '../TemplateDietManager';

const TemplateDietsPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
        Gestión de Plantillas de Dietas
      </Typography>
      
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Crea y gestiona plantillas de dietas que puedes reutilizar para diferentes pacientes. 
          Las plantillas te permiten ahorrar tiempo al crear dietas similares.
        </Typography>
        
        <TemplateDietManager />
      </Paper>
    </Box>
  );
};

export default TemplateDietsPage; 