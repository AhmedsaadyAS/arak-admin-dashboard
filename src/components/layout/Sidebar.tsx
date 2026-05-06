import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import "../../styles/layout.css";
import { navGroups } from "./navConfig";

export default function Sidebar() {
    const { user, hasPermission } = useAuth();

    // Filter groups and items based on permissions; empty groups are automatically hidden
    const filteredGroups = navGroups
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => user && hasPermission(item.permission)),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <aside className="sidebar select-none">
            <div className="sidebar-logo">
                <Link to="/dashboard" className="flex items-center gap-3">
                    <img src={logo} alt="Arak Logo" className="logo-img" />
                    <div className="logo-text text-white">ARAK</div>
                </Link>
            </div>

            {/* User Info Mini-Header */}
            <div className="px-4 mb-4 text-[11px] font-bold text-slate-400/50 uppercase tracking-wider">
                {user?.role || 'Guest'}
            </div>

            <nav className="sidebar-menu">
                {filteredGroups.map((group) => (
                    <div key={group.label} className="flex flex-col mb-4">
                        {/* Section Header */}
                        <div className="px-4 mb-2 text-[10px] font-bold tracking-widest text-slate-400/70 uppercase">
                            {group.label}
                        </div>
                        {/* Group Items */}
                        <div className="flex flex-col gap-1">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.key}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        "sidebar-item" + (isActive ? " sidebar-item-active" : "")
                                    }
                                >
                                    <span className="sidebar-icon">{item.icon}</span>
                                    <span className="sidebar-label">{item.label}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer pt-4 border-t border-slate-800/30">
                <p className="footer-text text-xs text-slate-500 text-center">
                    Arak Admin Dashboard © 2025
                </p>
            </div>
        </aside>
    );
}
