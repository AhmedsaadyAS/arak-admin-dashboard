import React from "react";
import { Search, Bell, Settings } from "lucide-react";
import "../../styles/layout.css";

export default function Topbar({ pageTitle = "Dashboard", onSelect }) {
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
          <button className="icon-btn">
            <Bell size={20} />
            <span className="notification-dot"></span>
          </button>
          <button className="icon-btn" onClick={() => onSelect && onSelect('settings')} title="Settings">
            <Settings size={20} />
          </button>
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
