import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Stack, CircularProgress, List, ListItemText, ListItemButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tooltip, MenuItem, Fab, IconButton, Select, FormControl, InputLabel, Alert, Snackbar, Checkbox } from '@mui/material';
import Grid from '@mui/material/Grid';
import { shoppingListService, dietService } from '../../services/api';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ShoppingListItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  is_purchased: boolean;
}

interface ShoppingList {
  id: number;
  name: string;
  status: string;
  items: ShoppingListItem[];
}

const STATUS_COLORS: Record<string, string> = {
  active: '#FFD600', // amarillo
  completed: '#2A7138', // verde principal
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Activa',
  completed: 'Completada',
};

const UNIT_OPTIONS = [
  { value: 'g', label: 'Gramos (g)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'unidades', label: 'Unidades' }
];

const ShoppingLists: React.FC = () => {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [addItemError, setAddItemError] = useState<string | null>(null);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [deletingItem, setDeletingItem] = useState<number | null>(null);
  const [deletingList, setDeletingList] = useState<number | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [creatingFromDiet, setCreatingFromDiet] = useState(false);
  const [hasWeeklyDiet, setHasWeeklyDiet] = useState(false);
  const [checkingDiet, setCheckingDiet] = useState(true);
  const [showDietBanner, setShowDietBanner] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean, listId: number | null }>({ open: false, listId: null });

  const fetchLists = async () => {
    try {
      setLoading(true);
      const data = await shoppingListService.getShoppingLists();
      setLists(data);
    } catch (err) {
      setError('No se pudieron cargar las listas de compras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  useEffect(() => {
    if (selectedList?.status === 'completed') {
      setShowAddItemForm(false);
    }
  }, [selectedList?.status]);

  useEffect(() => {
    const checkWeeklyDiet = async () => {
      try {
        console.log('Verificando dieta semanal...');
        const response = await dietService.hasWeeklyDiet();
        console.log('Respuesta del servidor:', response);
        setHasWeeklyDiet(response.data);
      } catch (err) {
        console.error('Error al verificar dieta semanal:', err);
        setHasWeeklyDiet(false);
      } finally {
        setCheckingDiet(false);
      }
    };

    checkWeeklyDiet();
  }, []);

  useEffect(() => {
    console.log('Estado actual:', { hasWeeklyDiet, checkingDiet });
  }, [hasWeeklyDiet, checkingDiet]);

  const handleOpenModal = () => {
    setNewListName('');
    setCreateError(null);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewListName('');
    setCreateError(null);
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      setCreateError('El nombre es requerido');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      await shoppingListService.createShoppingList({ name: newListName.trim() });
      await fetchLists();
      handleCloseModal();
    } catch (err) {
      console.error('Error al crear la lista:', err);
      setCreateError('Error al crear la lista. Por favor, intenta nuevamente.');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenDetailModal = async (list: ShoppingList) => {
    setSelectedList(list);
    setOpenDetailModal(true);
    try {
      const detail = await shoppingListService.getShoppingList(list.id);
      setSelectedList(detail);
    } catch (err) {
      console.error('Error al cargar el detalle de la lista:', err);
    }
  };

  const handleCloseDetailModal = () => {
    setOpenDetailModal(false);
    setSelectedList(null);
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemUnit('');
    setAddItemError(null);
    setShowAddItemForm(false);
  };

  const handleAddItem = async () => {
    if (!newItemName.trim() || !newItemQuantity.trim() || !newItemUnit.trim()) {
      setAddItemError('Todos los campos son obligatorios');
      return;
    }
    setAddingItem(true);
    setAddItemError(null);
    try {
      await shoppingListService.addItemToList(selectedList!.id, {
        name: newItemName.trim(),
        quantity: parseFloat(newItemQuantity),
        unit: newItemUnit.trim(),
      });
      const updatedDetail = await shoppingListService.getShoppingList(selectedList!.id);
      setSelectedList(updatedDetail);
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemUnit('');
    } catch (err) {
      setAddItemError('No se pudo agregar el ítem');
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!selectedList) return;
    
    setDeletingItem(itemId);
    try {
      await shoppingListService.deleteItemFromList(selectedList.id, itemId);
      setSelectedList((prev: ShoppingList | null) => prev ? {
        ...prev,
        items: prev.items.filter((item: ShoppingListItem) => item.id !== itemId)
      } : null);
    } catch (err) {
      console.error('Error al eliminar el ítem:', err);
    } finally {
      setDeletingItem(null);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedList) return;
    
    setUpdatingStatus(true);
    try {
      await shoppingListService.updateShoppingListStatus(selectedList.id, newStatus);
      const updatedDetail = await shoppingListService.getShoppingList(selectedList.id);
      setSelectedList(updatedDetail);
      
      // Actualizar la lista en la lista principal
      setLists(prevLists => 
        prevLists.map(list => 
          list.id === selectedList.id 
            ? { ...list, status: newStatus }
            : list
        )
      );

      // Si el estado cambia a completed, ocultar el formulario
      if (newStatus === 'completed') {
        setShowAddItemForm(false);
      }
    } catch (err) {
      console.error('Error al actualizar el estado:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteList = (listId: number) => {
    setConfirmDelete({ open: true, listId });
  };

  const confirmDeleteList = async () => {
    if (!confirmDelete.listId) return;
    setDeletingList(confirmDelete.listId);
    try {
      await shoppingListService.deleteShoppingList(confirmDelete.listId);
      setLists(prevLists => prevLists.filter(list => list.id !== confirmDelete.listId));
      if (selectedList?.id === confirmDelete.listId) {
        setSelectedList(null);
      }
      setSnackbar({
        open: true,
        message: 'Lista eliminada correctamente.',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Error al eliminar la lista.',
        severity: 'error'
      });
    } finally {
      setDeletingList(null);
      setConfirmDelete({ open: false, listId: null });
    }
  };

  const handleCloseDeleteDialog = () => {
    setConfirmDelete({ open: false, listId: null });
  };

  const handleCreateFromDiet = async () => {
    setCreatingFromDiet(true);
    try {
      // Verificar si ya existe una lista con ese nombre
      const existingList = lists.find(list => list.name === 'Lista desde dieta');
      if (existingList) {
        setShowDietBanner(false);
        setSnackbar({
          open: true,
          message: 'Ya tienes una lista creada desde la dieta',
          severity: 'info'
        });
        return;
      }

      const newList = await shoppingListService.createShoppingListFromDiet();
      setLists(prevLists => [...prevLists, newList]);
      setSelectedList(newList);
      setShowDietBanner(false); // Cerrar el banner después de crear la lista
      setSnackbar({
        open: true,
        message: 'Lista creada exitosamente desde la dieta',
        severity: 'success'
      });
    } catch (err: any) {
      console.error('Error al crear lista desde dieta:', err);
      const errorMessage = err.response?.status === 405 
        ? 'El servidor no permite crear listas desde la dieta en este momento. Por favor, intenta más tarde.'
        : 'Error al crear la lista desde la dieta. Por favor, intenta más tarde.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setCreatingFromDiet(false);
    }
  };

  const handleDownloadPDF = (list: ShoppingList) => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Lista de Compras', 14, 20);
    
    // Subtítulo con nombre de la lista
    doc.setFontSize(14);
    doc.text(list.name, 14, 30);
    
    // Fecha
    doc.setFontSize(10);
    doc.text(`Generado el ${new Date().toLocaleDateString()}`, 14, 40);
    
    // Asegurarse de que items sea un array
    const items = Array.isArray(list.items) ? list.items : [];
    
    // Tabla de items
    autoTable(doc, {
      startY: 50,
      head: [['Ítem', 'Cantidad', 'Unidad', 'Comprado']],
      body: items.map(item => [
        item.name,
        item.quantity.toString(),
        item.unit,
        item.is_purchased ? 'Sí' : 'No'
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [46, 125, 50], // Verde oscuro
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
    });
    
    // Guardar el PDF
    doc.save(`lista-compras-${list.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  // Nueva función para actualizar el estado de comprado de un ítem
  const handleTogglePurchased = async (itemId: number, currentValue: boolean) => {
    if (!selectedList) return;
    try {
      // Llamada al endpoint PATCH para actualizar el ítem
      await shoppingListService.updateItemInList(selectedList.id, itemId, {
        is_purchased: !currentValue,
      });
      // Actualizar el estado local con el nuevo valor
      setSelectedList((prev: ShoppingList | null) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map(item =>
            item.id === itemId ? { ...item, is_purchased: !currentValue } : item
          ),
        };
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'No se pudo actualizar el estado del ítem.',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {!checkingDiet && hasWeeklyDiet && showDietBanner && !lists.some(list => list.name === 'Lista desde dieta') && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2, 
            border: '1px solid', 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            color: 'text.primary',
            position: 'relative'
          }}
        >
          <IconButton
            onClick={() => setShowDietBanner(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary'
            }}
            size="small"
          >
            <CloseIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, pr: 4 }}>
            <Typography variant="h6">
              ¿Tienes una dieta creada, quieres crear una lista de compras automáticamente para esa dieta?
            </Typography>
            <Button
              variant="contained"
              startIcon={creatingFromDiet ? <CircularProgress size={20} /> : <AddIcon />}
              onClick={handleCreateFromDiet}
              disabled={creatingFromDiet}
              sx={{ 
                backgroundColor: '#2e7d32', // Verde oscuro
                color: 'white',
                '&:hover': {
                  backgroundColor: '#1b5e20', // Verde más oscuro al hover
                }
              }}
            >
              Crear Lista
            </Button>
          </Box>
        </Paper>
      )}

      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Listas de Compras
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenModal(true)}
            >
              Nueva Lista
            </Button>
          </Box>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : lists.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            No tienes listas de compras. Crea una nueva para comenzar.
          </Typography>
        ) : (
          <List>
            {lists.map((list) => (
              <ListItemButton
                key={list.id}
                onClick={() => handleOpenDetailModal(list)}
                sx={{
                  borderLeft: `4px solid ${STATUS_COLORS[list.status]}`,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemText
                  primary={list.name}
                  secondary={
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FiberManualRecordIcon 
                        sx={{ 
                          fontSize: 12,
                          color: STATUS_COLORS[list.status]
                        }} 
                      />
                      <Typography component="span" variant="body2" color="text.secondary">
                        {STATUS_LABELS[list.status]}
                      </Typography>
                    </Box>
                  }
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Descargar PDF">
                    <IconButton
                      edge="end"
                      aria-label="download"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPDF(list);
                      }}
                      color="primary"
                      size="small"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                    disabled={deletingList === list.id}
                    sx={{ color: 'error.main' }}
                    size="small"
                  >
                    {deletingList === list.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                  </IconButton>
                </Box>
              </ListItemButton>
            ))}
          </List>
        )}
      </Paper>
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Nueva Lista de Compras</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre de la lista"
            fullWidth
            value={newListName}
            onChange={e => setNewListName(e.target.value)}
            disabled={creating}
            error={!!createError}
            helperText={createError}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={creating}>Cancelar</Button>
          <Button onClick={handleCreateList} variant="contained" disabled={creating}>
            {creating ? 'Creando...' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openDetailModal} onClose={handleCloseDetailModal} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {selectedList ? selectedList.name : 'Detalle de la Lista'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {selectedList && (
                <>
                  <Tooltip title="Descargar PDF">
                    <IconButton 
                      onClick={() => handleDownloadPDF(selectedList)}
                      color="primary"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="status-select-label">Estado</InputLabel>
                    <Select
                      labelId="status-select-label"
                      value={selectedList.status}
                      label="Estado"
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={updatingStatus}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <MenuItem 
                          key={value} 
                          value={value}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>{label}</Typography>
                            <FiberManualRecordIcon sx={{ color: STATUS_COLORS[value], fontSize: 12 }} />
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedList && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Ítems de la Lista
              </Typography>
              {selectedList.items && selectedList.items.length > 0 ? (
                <List>
                  {selectedList.items.map((item: ShoppingListItem) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid #eee',
                        py: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox
                          checked={item.is_purchased}
                          onChange={() => handleTogglePurchased(item.id, item.is_purchased)}
                          color="primary"
                          disabled={deletingItem === item.id}
                        />
                        <ListItemText
                          primary={item.name}
                          secondary={`${item.quantity} ${item.unit}`}
                          sx={{
                            textDecoration: item.is_purchased ? 'line-through' : 'none',
                            color: item.is_purchased ? 'text.secondary' : 'inherit'
                          }}
                        />
                      </Box>
                      <IconButton
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={deletingItem === item.id}
                        sx={{ color: '#d32f2f' }}
                      >
                        {deletingItem === item.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                      </IconButton>
                    </Box>
                  ))}
                </List>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No hay ítems en esta lista.
                </Typography>
              )}
              <Box sx={{ mt: 3, position: 'relative' }}>
                {!showAddItemForm ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Fab
                      color="primary"
                      aria-label="add"
                      onClick={() => setShowAddItemForm(true)}
                      disabled={selectedList.status !== 'active'}
                      sx={{ bgcolor: '#2A7138' }}
                    >
                      <AddIcon sx={{ color: 'white' }} />
                    </Fab>
                  </Box>
                ) : (
                  <>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Agregar Nuevo Ítem
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        label="Nombre"
                        fullWidth
                        value={newItemName}
                        onChange={e => setNewItemName(e.target.value)}
                        disabled={addingItem}
                        error={!!addItemError}
                      />
                      <TextField
                        label="Cantidad"
                        fullWidth
                        type="number"
                        value={newItemQuantity}
                        onChange={e => setNewItemQuantity(e.target.value)}
                        disabled={addingItem}
                        error={!!addItemError}
                      />
                      <TextField
                        select
                        label="Unidad"
                        fullWidth
                        value={newItemUnit}
                        onChange={e => setNewItemUnit(e.target.value)}
                        disabled={addingItem}
                        error={!!addItemError}
                      >
                        {UNIT_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Stack>
                    {addItemError && (
                      <Typography color="error" sx={{ mt: 1 }}>
                        {addItemError}
                      </Typography>
                    )}
                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddItem}
                        disabled={addingItem}
                        sx={{ bgcolor: '#2A7138' }}
                      >
                        {addingItem ? 'Agregando...' : 'Agregar Ítem'}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setShowAddItemForm(false)}
                        disabled={addingItem}
                      >
                        Cancelar
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailModal}>Cerrar</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={confirmDelete.open}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>¿Eliminar lista de compras?</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar esta lista de compras? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deletingList !== null}>Cancelar</Button>
          <Button
            onClick={confirmDeleteList}
            color="error"
            variant="contained"
            disabled={deletingList !== null}
          >
            {deletingList !== null ? <CircularProgress size={20} /> : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity as 'success' | 'error' | 'info' | 'warning'}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ShoppingLists; 