import { Notification } from '../types/notification';
import api from './api';

export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return {
      success: true,
      data: response.data as Notification[]
    };
  } catch (error) {
    console.error('Error getting notifications:', error);
    return {
      success: false,
      data: []
    };
  }
};

export const markAsRead = async (notificationId: number) => {
  try {
    await api.patch(`/notifications/${notificationId}/read`);
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

export const deleteNotification = async (notificationId: number) => {
  try {
    await api.delete(`/notifications/${notificationId}`);
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}; 