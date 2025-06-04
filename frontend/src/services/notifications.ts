import axios from './axiosConfig';

export interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const notificationsService = {
  // Obtener todas las notificaciones
  getNotifications: async (): Promise<Notification[]> => {
    const response = await axios.get('/notifications/');
    return response.data;
  },

  // Marcar una notificación como leída
  markAsRead: async (id: number): Promise<void> => {
    await axios.post(`/notifications/${id}/read`);
  },

  // Marcar todas las notificaciones como leídas
  markAllAsRead: async (): Promise<void> => {
    const notifications = await notificationsService.getNotifications();
    await Promise.all(
      notifications
        .filter(n => !n.is_read)
        .map(n => notificationsService.markAsRead(n.id))
    );
  },

  // Eliminar una notificación
  deleteNotification: async (id: number): Promise<void> => {
    await axios.delete(`/notifications/${id}`);
  },

  // Obtener el conteo de notificaciones sin leer
  getUnreadCount: async (): Promise<number> => {
    const response = await axios.get('/notifications/unread-count');
    return response.data.unread_count;
  }
}; 