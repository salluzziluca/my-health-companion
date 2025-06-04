import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Badge, IconButton, Menu, Typography, Box, List, ListItem, ListItemText, Divider, Snackbar, Alert } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { notificationsService, Notification } from '../services/notifications';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

interface NotificationWithRead extends Notification {
  read: boolean;
}

// Contexto para las notificaciones
const NotificationsContext = createContext<{
  notifications: NotificationWithRead[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}>({
  notifications: [],
  unreadCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  refreshNotifications: async () => {},
});

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationWithRead[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastNotificationIdRef = useRef<number | null>(null);

  const refreshNotifications = useCallback(async () => {
    try {
      const response = await notificationsService.getNotifications();
      const notificationsWithRead = response.map(n => ({
        ...n,
        read: n.is_read || false
      }));
      
      // Solo actualizar si hay cambios reales
      const currentIds = notifications.map(n => n.id).sort();
      const newIds = notificationsWithRead.map(n => n.id).sort();
      
      if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
        setNotifications(notificationsWithRead);
        setUnreadCount(notificationsWithRead.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [notifications]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (id: number) => {
    try {
      await notificationsService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 1000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refreshNotifications,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const NotificationsBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [newNotification, setNewNotification] = useState<NotificationWithRead | null>(null);
  const lastShownNotificationIdRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSnackbarClose = () => {
    setShowSnackbar(false);
    setNewNotification(null);
  };

  const handleSnackbarClick = async () => {
    if (newNotification) {
      handleSnackbarClose();
      if (!newNotification.read) {
        await markAsRead(newNotification.id);
      }
      navigate('/weekly-diet');
    }
  };

  const handleNotificationClick = async (event: React.MouseEvent, notification: NotificationWithRead) => {
    // Si el click no fue en un botón, navegar a weekly-diet y marcar como leída
    if (event.target && !(event.target as HTMLElement).closest('button')) {
      if (!notification.read) {
        await markAsRead(notification.id);
      }
      navigate('/weekly-diet');
      handleClose();
    }
  };

  const handleMarkAsRead = async (notification: NotificationWithRead) => {
    await markAsRead(notification.id);
    handleClose();
  };

  const handleDelete = async (notification: NotificationWithRead) => {
    await deleteNotification(notification.id);
    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    handleClose();
  };

  // Efecto para mostrar el Snackbar cuando llega una nueva notificación
  useEffect(() => {
    if (notifications.length > 0) {
      const lastNotification = notifications[0];
      if (!lastNotification.read && 
          !showSnackbar && 
          lastNotification.id !== lastShownNotificationIdRef.current) {
        setNewNotification(lastNotification);
        setShowSnackbar(true);
        lastShownNotificationIdRef.current = lastNotification.id;
      }
    }
  }, [notifications, showSnackbar]);

  const userType = jwtDecode<{ type: string }>(localStorage.getItem('token') || '').type;
  if (userType === 'professional') return null;

  return (
    <Box>
      <IconButton
        size="large"
        color="inherit"
        onClick={handleClick}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notificaciones</Typography>
          {unreadCount > 0 && (
            <IconButton onClick={handleMarkAllAsRead} size="small">
              <Typography variant="caption" color="primary">Marcar todas como leídas</Typography>
            </IconButton>
          )}
        </Box>
        <Divider />
        <List sx={{ width: 360, maxHeight: 400, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText primary="No hay notificaciones" />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <ListItem
                key={notification.id}
                onClick={(e) => handleNotificationClick(e, notification)}
                sx={{
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.selected',
                    cursor: 'pointer'
                  },
                }}
              >
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.created_at).toLocaleString()}
                />
                <Box>
                  {!notification.read && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification);
                      }}
                      sx={{ mr: 1 }}
                    >
                      <Typography variant="caption" color="primary">Marcar como leída</Typography>
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification);
                    }}
                    color="error"
                  >
                    <Typography variant="caption" color="error">Eliminar</Typography>
                  </IconButton>
                </Box>
              </ListItem>
            ))
          )}
        </List>
      </Menu>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        onClick={handleSnackbarClick}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          variant="filled"
          sx={{ 
            width: '100%',
            bgcolor: 'success.light',
            '& .MuiAlert-icon': {
              color: 'success.dark'
            }
          }}
        >
          ¡Nueva dieta disponible! Haz clic para verla.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationsBell; 