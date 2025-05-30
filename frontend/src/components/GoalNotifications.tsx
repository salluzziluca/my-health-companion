import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Snackbar, Alert, AlertColor, Badge, IconButton, Menu, MenuItem, Typography, Box, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { EmojiEvents, TrendingUp, LocalFireDepartment, Notifications as NotificationsIcon, MonitorWeight } from '@mui/icons-material';

// Tipos de objetivos que podemos notificar
export type GoalType = 'streak' | 'calories' | 'meals' | 'weight';

// Interfaz para las notificaciones
interface GoalNotification {
  id: string;
  type: GoalType;
  message: string;
  severity: AlertColor;
  icon: React.ReactNode;
  timestamp: Date;
  read: boolean;
  goalKey?: string;
}

// Contexto para las notificaciones
interface GoalNotificationsContextType {
  showGoalNotification: (type: GoalType, message: string, goalKey?: string) => void;
  notifications: GoalNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  hasShownNotification: (goalKey: string) => boolean;
}

const GoalNotificationsContext = createContext<GoalNotificationsContextType | undefined>(undefined);

// Hook personalizado para usar las notificaciones
export const useGoalNotifications = () => {
  const context = useContext(GoalNotificationsContext);
  if (!context) {
    throw new Error('useGoalNotifications debe ser usado dentro de un GoalNotificationsProvider');
  }
  return context;
};

// Componente de la campanita de notificaciones
export const NotificationsBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useGoalNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: GoalNotification) => {
    markAsRead(notification.id);
    handleClose();
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
              <IconButton size="small" onClick={markAllAsRead} sx={{ mr: 1 }}>
                <Typography variant="caption" color="primary">Marcar todas como leídas</Typography>
              </IconButton>
              <IconButton size="small" onClick={clearNotifications}>
                <Typography variant="caption" color="error">Limpiar</Typography>
              </IconButton>
            </Box>
          )}
        </Box>
        <Divider />
        <List sx={{ p: 0 }}>
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
                  bgcolor: notification.read ? 'inherit' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {notification.icon}
                </ListItemIcon>
                <ListItemText
                  primary={notification.message}
                  secondary={notification.timestamp.toLocaleString()}
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: notification.read ? 'text.secondary' : 'text.primary'
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

// Función auxiliar para obtener el icono basado en el tipo
const getIconByType = (type: GoalType): React.ReactNode => {
  switch (type) {
    case 'streak':
      return <LocalFireDepartment />;
    case 'calories':
      return <TrendingUp />;
    case 'meals':
      return <EmojiEvents />;
    case 'weight':
      return <MonitorWeight />;
    default:
      return <EmojiEvents />;
  }
};

// Proveedor del contexto
export const GoalNotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<GoalNotification[]>(() => {
    // Cargar notificaciones del localStorage al iniciar
    const saved = localStorage.getItem('goalNotifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convertir las fechas de string a Date y reconstruir los iconos
        return parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
          icon: getIconByType(n.type) // Reconstruir el icono basado en el tipo
        }));
      } catch (e) {
        console.error('Error al cargar notificaciones:', e);
        return [];
      }
    }
    return [];
  });
  const [currentNotification, setCurrentNotification] = useState<GoalNotification | null>(null);

  // Guardar notificaciones en localStorage cuando cambien
  useEffect(() => {
    try {
      // Convertir las notificaciones a un formato seguro para localStorage
      const notificationsToSave = notifications.map(n => ({
        ...n,
        icon: undefined, // No guardamos el componente React
        type: n.type // Guardamos el tipo para reconstruir el icono
      }));
      localStorage.setItem('goalNotifications', JSON.stringify(notificationsToSave));
    } catch (e) {
      console.error('Error al guardar notificaciones:', e);
    }
  }, [notifications]);

  const getGoalConfig = useCallback((type: GoalType): { severity: AlertColor; icon: React.ReactNode } => {
    switch (type) {
      case 'streak':
        return {
          severity: 'success',
          icon: <LocalFireDepartment />
        };
      case 'calories':
        return {
          severity: 'info',
          icon: <TrendingUp />
        };
      case 'meals':
        return {
          severity: 'warning',
          icon: <EmojiEvents />
        };
      case 'weight':
        return {
          severity: 'success',
          icon: <MonitorWeight />
        };
      default:
        return {
          severity: 'info',
          icon: <EmojiEvents />
        };
    }
  }, []);

  const hasShownNotification = useCallback((goalKey: string): boolean => {
    return notifications.some(n => n.goalKey === goalKey);
  }, [notifications]);

  const showGoalNotification = useCallback((type: GoalType, message: string, goalKey?: string) => {
    // Si se proporciona un goalKey y ya se mostró la notificación, no mostrar de nuevo
    if (goalKey && hasShownNotification(goalKey)) {
      return;
    }

    const { severity } = getGoalConfig(type);
    const icon = getIconByType(type); // Usar la función auxiliar para obtener el icono
    const newNotification: GoalNotification = {
      id: Date.now().toString(),
      type,
      message,
      severity,
      icon,
      timestamp: new Date(),
      read: false,
      goalKey
    };
    
    // Evitar duplicados verificando el goalKey
    setNotifications(prev => {
      if (goalKey && prev.some(n => n.goalKey === goalKey)) {
        return prev;
      }
      return [newNotification, ...prev];
    });
    
    // Solo mostrar el snackbar si no hay una notificación actual
    if (!currentNotification) {
      setCurrentNotification(newNotification);
    }
  }, [getGoalConfig, hasShownNotification, currentNotification]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const handleCloseSnackbar = () => {
    setCurrentNotification(null);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <GoalNotificationsContext.Provider 
      value={{ 
        showGoalNotification, 
        notifications, 
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        hasShownNotification
      }}
    >
      {children}
      <Snackbar
        open={!!currentNotification}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={currentNotification?.severity}
          icon={currentNotification?.icon}
          variant="filled"
          sx={{ 
            width: '100%',
            minWidth: '300px',
            boxShadow: 3,
            '& .MuiAlert-icon': {
              alignItems: 'center'
            }
          }}
        >
          {currentNotification?.message}
        </Alert>
      </Snackbar>
    </GoalNotificationsContext.Provider>
  );
};

export default GoalNotificationsProvider; 