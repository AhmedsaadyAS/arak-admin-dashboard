import React from "react";
import { Search, Bell, Settings, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import ApiStatus from "../common/ApiStatus";
import { useRefresh } from "../../context/RefreshContext";
import "../../styles/layout.css";

export default function Topbar({ pageTitle = "Dashboard" }) {
  const { triggerRefresh } = useRefresh();

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
        </div>

        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">Nabila A.</span>
            <span className="user-role">Admin</span>
          </div>
          <div className="user-avatar"></div>
        </div>
      </div>
    </header>
  );
}
