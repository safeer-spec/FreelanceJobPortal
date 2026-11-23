import { API_BASE_URL } from "./apiBase.js";
import { handleUnauthorized } from "./authSession.js";



async function notificationRequest(role, suffix = "", options = {}) {
  const response = await fetch(`${API_BASE_URL}/notifications/${role}${suffix}`, {
    credentials: "include",
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const result = await response.json().catch(() => ({}));
  if (response.status === 401) handleUnauthorized(role);
  if (!response.ok) throw new Error(result.message || "Could not update notifications.");
  return result;
}

export function getNotifications(role) { return notificationRequest(role); }
export function markNotificationRead(role, id) { return notificationRequest(role, `/${encodeURIComponent(id)}/read`, { method: "PATCH" }); }
export function markNotificationsRead(role) { return notificationRequest(role, "/read-all", { method: "PATCH" }); }

export function deleteAllNotifications(role) { return notificationRequest(role, "", { method: "DELETE" }); }
