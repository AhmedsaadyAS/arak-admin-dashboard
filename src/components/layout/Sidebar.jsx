import React from "react";
import { Link, NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    CalendarDays,
    User,
    MessageSquare,
    Activity,
    CreditCard,
    BarChart2
} from "lucide-react";
import logo from "../../assets/logo.png";
import "../../styles/layout.css";

const menuItems = [
    { key: "dashboard", label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { key: "students", label: "Students", path: "/students", icon: <Users size={20} /> },
    { key: "teachers", label: "Teachers", path: "/teachers", icon: <GraduationCap size={20} /> },
    { key: "schedule", label: "Schedule", path: "/schedule", icon: <CalendarDays size={20} /> },
    { key: "events", label: "Event", path: "/events", icon: <CalendarDays size={20} /> },
    { key: "fees", label: "Fees", path: "/fees", icon: <CreditCard size={20} /> },
    { key: "reports", label: "Reports", path: "/reports", icon: <BarChart2 size={20} /> },
    { key: "user", label: "User Management", path: "/user", icon: <User size={20} /> },
    { key: "chat", label: "Chat", path: "/chat", icon: <MessageSquare size={20} /> },
    { key: "activity", label: "Latest Activity", path: "/activity", icon: <Activity size={20} /> },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <img src={logo} alt="Arak Logo" className="logo-img" />
                <div className="logo-text">ARAK</div>
            </div>
            <nav className="sidebar-menu">
                {menuItems.map((item) => (
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
            </nav>

            <div className="sidebar-footer">
                <p className="footer-text">Arak Admin Dashboard © 2025</p>
            </div>
        </aside>
    );
}
