import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../utils/api';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);

  const isLoggedIn = () => !!localStorage.getItem('accessToken');

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn()) return; // Don't fetch if not logged in
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnread(data.unread || 0);
    } catch {} // Silently fail — don't cause re-renders on 401
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      if (isLoggedIn()) fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {}
  }, []);

  const markRead = useCallback(async (id) => {
    if (!isLoggedIn()) return;
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
      setUnread((prev) => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const deleteOne = useCallback(async (id) => {
    if (!isLoggedIn()) return;
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch {}
  }, []);

  const addLocal = useCallback((notif) => {
    setNotifications((prev) => [notif, ...prev]);
    setUnread((prev) => prev + 1);
  }, []);

  const reset = useCallback(() => {
    setNotifications([]);
    setUnread(0);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unread, fetchNotifications, markAllRead, markRead, deleteOne, addLocal, reset }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
};
