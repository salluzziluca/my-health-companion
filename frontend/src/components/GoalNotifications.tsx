import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, Box, List, ListItem, ListItemText, Divider, Snackbar, Alert, Button } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { notificationsService, Notification } from '../services/notifications';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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

interface GoalNotificationsProps {
  onNotificationClick?: () => void;
}

export const NotificationsBell: React.FC<GoalNotificationsProps> = ({ onNotificationClick }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [newNotification, setNewNotification] = useState<NotificationWithRead | null>(null);
  const lastShownNotificationIdRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const { userType } = useAuth();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (onNotificationClick) {
      onNotificationClick();
    }
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

  const handleNotificationClick = async (event: React.MouseEvent<HTMLElement>, notification: NotificationWithRead) => {
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

  if (userType === 'professional') return null;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
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
            maxHeight: 300,
            width: 360,
            maxWidth: '100%',
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
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
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{ textTransform: 'none' }}
            >
              Marcar todas como leídas
            </Button>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography>No hay notificaciones</Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem 
              key={notification.id}
              onClick={(e: React.MouseEvent<HTMLElement>) => handleNotificationClick(e, notification)}
              sx={{
                whiteSpace: 'normal',
                py: 1.5,
                display: 'block',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: notification.read ? 400 : 600,
                    color: notification.read ? 'text.secondary' : 'text.primary',
                  }}
                >
                  {notification.message}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {!notification.read && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification);
                      }}
                      sx={{ p: 0.5 }}
                    >
                      <Typography variant="caption" color="primary">
                        Marcar como leída
                      </Typography>
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification);
                    }}
                    sx={{ p: 0.5 }}
                  >
                    <Typography variant="caption" color="error">
                      Eliminar
                    </Typography>
                  </IconButton>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {new Date(notification.created_at).toLocaleString()}
              </Typography>
            </MenuItem>
          ))
        )}
      </Menu>

      <Snackbar
        open={showSnackbar}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          width: '100%',
          maxWidth: '600px',
          '& .MuiAlert-root': {
            width: '100%',
            backgroundColor: 'white',
            boxShadow: 3,
            borderRadius: 2,
            padding: 2
          }
        }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="info"
          sx={{
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '1.1rem',
              color: 'text.primary',
              fontWeight: 500
            },
            '& .MuiAlert-icon': {
              color: 'primary.main'
            },
            '& .MuiAlert-action': {
              alignItems: 'center',
              paddingRight: 1,
              display: 'flex',
              gap: 2
            },
            '& .MuiIconButton-root': {
              color: 'text.secondary',
              '&:hover': {
                color: 'text.primary'
              },
              padding: 1,
              marginRight: 1
            }
          }}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button 
                variant="contained" 
                color="success"
                onClick={handleSnackbarClick}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3
                }}
              >
                Ver Dieta
              </Button>
            </Box>
          }
        >
          {newNotification?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationsBell;
