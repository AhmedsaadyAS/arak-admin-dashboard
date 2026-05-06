import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, Settings, RefreshCw, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ApiStatus from "../common/ApiStatus";
import { useRefresh } from "../../context/RefreshContext";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import "../../styles/layout.css";

function formatNotifTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function Topbar({ pageTitle = "Dashboard" }) {
  const { triggerRefresh } = useRefresh();
  const { user, logout } = useAuth();
  const { unreadCount, recentMessages } = useNotifications();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h2>{pageTitle}</h2>
      </div>

      <div className="topbar-actions">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search here..." />
        </div>

        <div className="action-icons">
          <ApiStatus />
          <button className="icon-btn" onClick={triggerRefresh} title="Refresh Data">
            <RefreshCw size={20} />
          </button>

          {/* Notification Bell */}
          <div className="notification-wrapper" ref={dropdownRef}>
            <button
              className="icon-btn"
              onClick={() => setShowDropdown(prev => !prev)}
              title={unreadCount > 0 ? `${unreadCount} unread messages` : 'No new messages'}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showDropdown && (
              <div className="notification-dropdown">
                <div className="notification-dropdown-header">
                  <h4>Messages</h4>
                  {unreadCount > 0 && <span className="notif-count">{unreadCount} unread</span>}
                </div>
                <div className="notification-dropdown-body">
                  {recentMessages.length === 0 ? (
                    <div className="notif-empty">No new messages</div>
                  ) : (
                    recentMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className="notif-item"
                        onClick={() => {
                          setShowDropdown(false);
                          navigate('/chat');
                        }}
                      >
                        <div className="notif-avatar">{msg.name.charAt(0)}</div>
                        <div className="notif-content">
                          <div className="notif-name">
                            {msg.name}
                            <span className="notif-badge-small">{msg.count}</span>
                          </div>
                          <p className="notif-text">{msg.message}</p>
                          <span className="notif-time">{formatNotifTime(msg.time)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="notification-dropdown-footer">
                  <Link to="/chat" onClick={() => setShowDropdown(false)}>
                    View all messages
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link to="/settings" className="icon-btn" title="Settings">
            <Settings size={20} />
          </Link>
          <button className="icon-btn" onClick={handleLogout} title="Logout">
            <LogOut size={20} />
          </button>
        </div>

        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.role || 'Admin'}</span>
          </div>
          <div className="user-avatar">{user?.avatar || 'U'}</div>
        </div>
      </div>
    </header>
  );
}
