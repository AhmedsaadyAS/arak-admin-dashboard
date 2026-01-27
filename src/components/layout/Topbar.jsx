import React from "react";
import { Search, Bell, Settings, RefreshCw, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ApiStatus from "../common/ApiStatus";
import { useRefresh } from "../../context/RefreshContext";
import { useAuth } from "../../context/AuthContext";
import "../../styles/layout.css";

export default function Topbar({ pageTitle = "Dashboard" }) {
  const { triggerRefresh } = useRefresh();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
          <button className="icon-btn">
            <Bell size={20} />
            <span className="notification-dot"></span>
          </button>
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
