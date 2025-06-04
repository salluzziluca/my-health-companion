<<<<<<< HEAD
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Snackbar, Alert, Badge, IconButton, Menu, MenuItem, Typography, Box, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { notificationsService, Notification } from '../services/notifications';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getNotifications, markAsRead, deleteNotification } from '../services/notificationService';
=======
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Badge, IconButton, Menu, Typography, Box, List, ListItem, ListItemText, Divider, Snackbar, Alert } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { notificationsService, Notification } from '../services/notifications';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

interface NotificationWithRead extends Notification {
  read: boolean;
}
>>>>>>> temp-changes

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

<<<<<<< HEAD
const getUserTypeFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = jwtDecode<JwtPayload>(token);
    const userType = decoded.user_type || decoded.type || decoded.role || null;
    console.log('[NOTIF] Tipo de usuario detectado:', userType);
    return userType;
  } catch {
    return null;
  }
};

interface GoalNotificationsProps {
  onNotificationClick?: () => void;
}

export const NotificationsBell: React.FC<GoalNotificationsProps> = ({ onNotificationClick }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
  const [shownNotifications, setShownNotifications] = useState<number[]>([]);
  const navigate = useNavigate();
  const { userType } = useAuth();
=======
export const NotificationsBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [newNotification, setNewNotification] = useState<NotificationWithRead | null>(null);
  const lastShownNotificationIdRef = useRef<number | null>(null);
  const navigate = useNavigate();
>>>>>>> temp-changes

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

<<<<<<< HEAD
  const handleSnackbarClose = async () => {
    if (latestNotification && !latestNotification.is_read) {
      await markAsRead(latestNotification.id);
    }
    setShowSnackbar(false);
  };

  const handleViewDiet = async () => {
    if (latestNotification) {
      await deleteNotification(latestNotification.id);
    }
    setShowSnackbar(false);
    navigate('/weekly-diet');
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotifications();
        if (response.success) {
          setNotifications(response.data);
          const unread = response.data.filter((n: Notification) => !n.is_read).length;
          setUnreadCount(unread);

          // Mostrar Snackbar solo para notificaciones no leídas y no mostradas
          const latestUnread = response.data.find((n: Notification) => !n.is_read);
          if (latestUnread && !shownNotifications.includes(latestUnread.id)) {
            setLatestNotification(latestUnread);
            setShowSnackbar(true);
            setShownNotifications(prev => [...prev, latestUnread.id]);
          }
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 1000);

    return () => clearInterval(interval);
  }, [shownNotifications]);

=======
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
>>>>>>> temp-changes
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
<<<<<<< HEAD
            maxHeight: 300,
            width: 360,
            maxWidth: '100%',
            mt: 1.5
          }
=======
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
>>>>>>> temp-changes
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
<<<<<<< HEAD
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography>No hay notificaciones</Typography>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem 
              key={notification.id}
              onClick={() => {
                handleClose();
                navigate('/weekly-diet');
              }}
              sx={{
                whiteSpace: 'normal',
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                  borderBottom: 'none'
                },
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: notification.is_read ? 400 : 600,
                    color: notification.is_read ? 'text.secondary' : 'text.primary'
                  }}
                >
                  {notification.message}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.5 }}
                >
                  {new Date(notification.created_at).toLocaleString()}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    color: 'error.dark'
                  }
                }}
              >
                <Typography variant="caption" color="inherit">
                  Eliminar
                </Typography>
              </IconButton>
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
                onClick={handleViewDiet}
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
          {latestNotification?.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationsBell;

// Proveedor del contexto
export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = useCallback(async () => {
    try {
      const [notifs, count] = await Promise.all([
        notificationsService.getNotifications(),
        notificationsService.getUnreadCount()
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    }
  }, []);

  // Cargar notificaciones al montar el componente y cada 1 segundo
  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 1000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const markAsRead = useCallback(async (id: number) => {
    await notificationsService.markAsRead(id);
    await refreshNotifications();
  }, [refreshNotifications]);

  const markAllAsRead = useCallback(async () => {
    await notificationsService.markAllAsRead();
    await refreshNotifications();
  }, [refreshNotifications]);

  const deleteNotification = useCallback(async (id: number) => {
    await notificationsService.deleteNotification(id);
    await refreshNotifications();
  }, [refreshNotifications]);

  return (
    <NotificationsContext.Provider 
      value={{ 
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}; 
=======
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
>>>>>>> temp-changes
