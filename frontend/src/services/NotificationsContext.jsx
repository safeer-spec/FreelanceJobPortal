import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { deleteAllNotifications, getNotifications, markNotificationRead, markNotificationsRead } from "../services/notificationservices.js";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ profile, children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const role = profile?.role;

  const refresh = useCallback(async () => {
    if (!["admin", "client", "freelancer"].includes(role)) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const result = await getNotifications(role);
      setNotifications(result.notifications || []);
      setUnreadCount(Number(result.unreadCount) || 0);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not load notifications.");
    }
  }, [role]);

  useEffect(() => {
    refresh();
    if (!role) return undefined;
    const timer = window.setInterval(refresh, 30000);
    const update = () => refresh();
    window.addEventListener("jobportal:notifications-updated", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("jobportal:notifications-updated", update);
    };
  }, [refresh, role]);

  const markRead = useCallback(async (id) => {
    await markNotificationRead(role, id);
    setNotifications((current) => current.map((item) => item._id === id ? { ...item, readAt: item.readAt || new Date().toISOString() } : item));
    setUnreadCount((count) => Math.max(0, count - (notifications.find((item) => item._id === id && !item.readAt) ? 1 : 0)));
  }, [notifications, role]);

  const markAllRead = useCallback(async () => {
    await markNotificationsRead(role);
    setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
    setUnreadCount(0);
  }, [role]);

  const deleteAll = useCallback(async () => {
    try {
      await deleteAllNotifications(role);
      setNotifications([]);
      setUnreadCount(0);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not delete notifications.");
      throw requestError;
    }
  }, [role]);
  const value = useMemo(() => ({ notifications, unreadCount, error, refresh, markRead, markAllRead, deleteAll }), [notifications, unreadCount, error, refresh, markRead, markAllRead, deleteAll]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  return context || { notifications: [], unreadCount: 0, error: "", refresh: async () => {}, markRead: async () => {}, markAllRead: async () => {}, deleteAll: async () => {} };
}
