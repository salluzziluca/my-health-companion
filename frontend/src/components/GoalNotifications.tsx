import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Snackbar, Alert, Badge, IconButton, Menu, MenuItem, Typography, Box, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { notificationsService, Notification } from '../services/notifications';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getNotifications, markAsRead, deleteNotification } from '../services/notificationService';

// Contexto para las notificaciones
interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

interface JwtPayload {
  user_type?: string;
  type?: string;
  role?: string;
  [key: string]: any;
}

// Hook personalizado para usar las notificaciones
export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  const userType = getUserTypeFromToken();
  // Solo bloquear para profesionales
  if (userType === 'professional') {
    return {
      notifications: [],
      unreadCount: 0,
      markAsRead: async () => {},
      markAllAsRead: async () => {},
      deleteNotification: async () => {},
      refreshNotifications: async () => {},
    };
  }
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de un NotificationsProvider');
  }
  return context;
};

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

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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

  if (userType === 'professional') return null;

  return (
    <>
      <IconButton
        size="large"
        aria-label="mostrar notificaciones"
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
          sx: {
            maxHeight: 300,
            width: 360,
            maxWidth: '100%',
            mt: 1.5
          }
        }}
      >
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