import React, { useContext, useState } from "react";
import { NotificationContext } from "../contexts/NotificationContext";
import { X, CheckCheck, Trash2, Bell, FileText } from "lucide-react";
import "./NotificationBar.css";

const NotificationBar = ({ isOpen, onClose }) => {
  const {
    notifications = [],
    unreadCount = 0,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useContext(NotificationContext);

  const [filter, setFilter] = useState("all");

  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.read : true
  );

  const formatDate = (date) => {
    const now = new Date();
    const d = new Date(date);
    const diff = now - d;

    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className={`notification-bar hybrid ${isOpen ? "open" : ""}`}>
      {/* HEADER */}
      <div className="notif-header">
        <div className="notif-title">
          <Bell size={22} />
          <h3>Notifications</h3>
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </div>

        <div className="notif-actions">
          {unreadCount > 0 && (
            <button className="header-btn" onClick={markAllAsRead}>
              <CheckCheck size={18} />
            </button>
          )}
          <button className="header-btn close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="notif-filters">
        <button
          className={`filter-chip ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`filter-chip ${filter === "unread" ? "active" : ""}`}
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* LIST */}
      <div className="notif-list">
        {filteredNotifications.length === 0 ? (
          <div className="notif-empty">
            <Bell size={50} />
            <p>No notifications</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              className={`notif-card ${notif.read ? "read" : "unread"}`}
              onClick={() => !notif.read && markAsRead(notif._id)}
            >
              {!notif.read && <div className="left-indicator"></div>}

              <div className="notif-content">
                <h4>{notif.title}</h4>
                <p>{notif.message}</p>
                <span className="notif-time">{formatDate(notif.createdAt)}</span>

                {notif.fileUrl && (
                  <a
                    href={notif.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="view-file-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FileText size={16} />
                    View Attachment
                  </a>
                )}
              </div>

              <button
                className="delete-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notif._id);
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationBar;
