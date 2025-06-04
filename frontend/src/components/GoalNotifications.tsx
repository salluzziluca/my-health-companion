import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Snackbar, Alert, Badge, IconButton, Menu, Typography, Box, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { notificationsService, Notification } from '../services/notifications';
import { jwtDecode } from 'jwt-decode';

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

// Componente de la campanita de notificaciones
export const NotificationsBell: React.FC = () => {
  const userType = getUserTypeFromToken();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, refreshNotifications } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  if (userType === 'professional') return null;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    handleClose();
  };

  const handleDeleteClick = async (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
  };

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
            width: 360,
            maxHeight: 400,
            mt: 1.5
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notificaciones</Typography>
          {notifications.length > 0 && (
            <Box>
              <IconButton 
                size="small" 
                onClick={async () => {
                  await markAllAsRead();
                  await refreshNotifications();
                }} 
                sx={{ mr: 1 }}
              >
                <Typography variant="caption" color="primary">Marcar todas como leídas</Typography>
              </IconButton>
            </Box>
          )}
        </Box>
        <Divider />
        <List>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary="No hay notificaciones" 
                sx={{ textAlign: 'center', color: 'text.secondary' }}
              />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <ListItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: notification.is_read ? 'inherit' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    aria-label="eliminar"
                    onClick={(e) => handleDeleteClick(e, notification)}
                  >
                    <Typography variant="caption" color="error">Eliminar</Typography>
                  </IconButton>
                }
              >
                <ListItemText
                  primary={notification.message}
                  secondary={new Date(notification.created_at).toLocaleString()}
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: notification.is_read ? 'text.secondary' : 'text.primary'
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption',
                    color: 'text.secondary'
                  }}
                />
              </ListItem>
            ))
          )}
        </List>
      </Menu>
    </>
  );
};

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

  // Cargar notificaciones al montar el componente y cada 30 segundos
  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 30000);
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

export default NotificationsProvider; 