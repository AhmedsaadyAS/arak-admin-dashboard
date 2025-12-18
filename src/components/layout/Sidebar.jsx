import React from "react";
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
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { key: "students", label: "Students", icon: <Users size={20} /> },
    { key: "teachers", label: "Teachers", icon: <GraduationCap size={20} /> },
    { key: "schedule", label: "Schedule", icon: <CalendarDays size={20} /> },
    { key: "events", label: "Event", icon: <CalendarDays size={20} /> },
    { key: "fees", label: "Fees", icon: <CreditCard size={20} /> },
    { key: "reports", label: "Reports", icon: <BarChart2 size={20} /> },
    { key: "user", label: "User Management", icon: <User size={20} /> },
    { key: "chat", label: "Chat", icon: <MessageSquare size={20} /> },
    { key: "activity", label: "Latest Activity", icon: <Activity size={20} /> },
];

export default function Sidebar({ active, onSelect }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <img src={logo} alt="Arak Logo" className="logo-img" />
                <div className="logo-text">ARAK</div>
            </div>
            <nav className="sidebar-menu">
                {menuItems.map((item) => (
                    <button
                        key={item.key}
                        className={
                            "sidebar-item" + (active === item.key ? " sidebar-item-active" : "")
                        }
                        onClick={() => onSelect(item.key)}
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <p className="footer-text">Arak Admin Dashboard © 2025</p>

            </div>
        </aside>
    );
}
