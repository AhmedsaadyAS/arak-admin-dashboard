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
    BarChart2,
    Settings as SettingsIcon,
    Shield,
    Award,
    BookOpen
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";
import "../../styles/layout.css";

// Define Menu Items with Role Permissions
// Note: 'Super Admin' has implicit access to EVERYTHING, so we don't need to list it everywhere 
// if we handle the logic correctly. But explicit is safer.
const menuItems = [
    {
        key: "dashboard",
        label: "Dashboard",
        path: "/dashboard",
        icon: <LayoutDashboard size={20} />,
        allowedRoles: ['Super Admin', 'Admin', 'Fees Admin', 'Users Admin', 'Academic Admin']
    },
    {
        key: "students",
        label: "Students",
        path: "/students",
        icon: <Users size={20} />,
        allowedRoles: ['Super Admin', 'Admin', 'Users Admin', 'Academic Admin']
    },
    {
        key: "teachers",
        label: "Teachers",
        path: "/teachers",
        icon: <GraduationCap size={20} />,
        allowedRoles: ['Super Admin', 'Admin', 'Users Admin', 'Academic Admin']
    },
    {
        key: "schedule",
        label: "Schedule",
        path: "/schedule",
        icon: <CalendarDays size={20} />,
        allowedRoles: ['Super Admin', 'Admin', 'Academic Admin']
    },
    {
        key: "events",
        label: "Event",
        path: "/events",
        icon: <CalendarDays size={20} />,
        allowedRoles: ['Super Admin', 'Admin', 'Academic Admin']
    },
    {
        key: "fees",
        label: "Fees",
        path: "/fees",
        icon: <CreditCard size={20} />,
        allowedRoles: ['Super Admin', 'Fees Admin']
    },
    {
        key: "reports",
        label: "Reports",
        path: "/reports",
        icon: <BarChart2 size={20} />,
        allowedRoles: ['Super Admin', 'Admin', 'Academic Admin', 'Fees Admin']
    },
    {
        key: "evaluations",
        label: "Gradebook",
        path: "/evaluations",
        icon: <Award size={20} />,
        allowedRoles: ['Super Admin', 'Admin', 'Academic Admin']
    },
    {
        key: "tasks",
        label: "Task Monitor",
        path: "/tasks",
        icon: <BookOpen size={20} />,
        allowedRoles: ['Super Admin', 'Admin', 'Academic Admin']
    },
    {
        key: "user",
        label: "User Management",
        path: "/user",
        icon: <User size={20} />,
        allowedRoles: ['Super Admin', 'Users Admin']
    },
    {
        key: "chat",
        label: "Chat",
        path: "/chat",
        icon: <MessageSquare size={20} />,
        allowedRoles: ['Super Admin', 'Admin', 'Users Admin']
    },
    {
        key: "activity",
        label: "Latest Activity",
        path: "/activity",
        icon: <Activity size={20} />,
        allowedRoles: ['Super Admin']
    },
];

export default function Sidebar() {
    const { user } = useAuth();

    // Filtering Logic
    const filteredItems = menuItems.filter(item => {
        if (!user) return false;
        if (user.role === 'Super Admin') return true; // Super Admin sees all
        if (!item.allowedRoles) return true; // Public items (if any)
        return item.allowedRoles.includes(user.role);
    });

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <img src={logo} alt="Arak Logo" className="logo-img" />
                <div className="logo-text">ARAK</div>
                {/* Optional: Show Role Badge */}
                {/* <span style={{fontSize:'0.6rem', background:'#e0e7ff', color:'#3730a3', padding:'2px 6px', borderRadius:'4px', marginLeft:'auto'}}>{user?.role}</span> */}
            </div>

            {/* User Info Mini-Header */}
            <div style={{ padding: '0 1.5rem', marginBottom: '1rem', fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {user?.role || 'Guest'}
            </div>

            <nav className="sidebar-menu">
                {filteredItems.map((item) => (
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
