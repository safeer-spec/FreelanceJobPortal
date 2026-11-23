import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../services/NotificationsContext.jsx";
import "./notifications.css";

export default function NotificationsPage() {
  const { notifications, unreadCount, error, refresh, markRead, markAllRead, deleteAll } = useNotifications();
  const [deletingAll, setDeletingAll] = useState(false);
  useEffect(() => { refresh(); }, [refresh]);


  async function handleDeleteAll() {
    if (!notifications.length || deletingAll) return;
    if (!window.confirm("Delete all notifications? This action cannot be undone.")) return;
    setDeletingAll(true);
    try { await deleteAll(); }
    catch { /* The page displays the error from the notifications context. */ }
    finally { setDeletingAll(false); }
  }
  async function openNotification(item) {
    if (!item.readAt) {
      try { await markRead(item._id); } catch { /* The notification remains available on the next refresh. */ }
    }
  }

  return (
    <main className="notifications-page">
      <div className="notifications-page__heading">
        <div><p className="notifications-page__eyebrow">Your account</p><h1>Notifications</h1><p>Approvals, rejections, application updates, and other account activity.</p></div>
        <div className="notifications-page__actions">
          <button type="button" onClick={markAllRead} disabled={!unreadCount}>Mark all as read</button>
          <button type="button" className="notifications-page__delete" onClick={handleDeleteAll} disabled={!notifications.length || deletingAll}>{deletingAll ? "Deleting..." : "Delete all"}</button>
        </div>
      </div>
      {error && <p className="notifications-page__error" role="alert">{error}</p>}
      {notifications.length ? <div className="notifications-list">
        {notifications.map((item) => <Link key={item._id} to={item.link || "/notifications"} className={`notification-item${item.readAt ? " is-read" : " is-unread"}`} onClick={() => openNotification(item)}>
          <span className={`notification-item__dot${item.readAt ? "" : " is-unread"}`} aria-hidden="true" />
          <span className="notification-item__body"><strong>{item.title}</strong><span>{item.message}</span><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time></span>
        </Link>)}
      </div> : null}
    </main>
  );
}
