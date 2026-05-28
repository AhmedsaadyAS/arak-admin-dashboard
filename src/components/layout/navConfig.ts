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
    BarChart2,
    Award,
    FileSpreadsheet,
    School,
    ClipboardList,
    BookOpen,
} from "lucide-react";
import { PERMISSIONS } from "../../config/permissions";

export interface NavItem {
    key: string;
    label: string;
    path: string;
    icon: React.ReactNode;
    permission: string;
}

export interface NavGroup {
    label: string;
    items: NavItem[];
}

export const navGroups: NavGroup[] = [
    {
        label: "Overview",
        items: [
            {
                key: "dashboard",
                label: "Dashboard",
                path: "/dashboard",
                icon: React.createElement(LayoutDashboard, { size: 20 }),
                permission: PERMISSIONS.DASHBOARD,
            },
        ],
    },
    {
        label: "Academic",
        items: [
            {
                key: "grades",
                label: "Classes",
                path: "/grades",
                icon: React.createElement(School, { size: 20 }),
                permission: PERMISSIONS.GRADES,
            },
            {
                key: "schedule",
                label: "Schedule",
                path: "/schedule",
                icon: React.createElement(CalendarDays, { size: 20 }),
                permission: PERMISSIONS.SCHEDULE,
            },
            {
                key: "control-sheets",
                label: "Control Sheets",
                path: "/control/sheets",
                icon: React.createElement(FileSpreadsheet, { size: 20 }),
                permission: PERMISSIONS.CONTROL_SHEETS,
            },
        ],
    },
    {
        label: "People",
        items: [
            {
                key: "students",
                label: "Students",
                path: "/students",
                icon: React.createElement(Users, { size: 20 }),
                permission: PERMISSIONS.STUDENTS,
            },
            {
                key: "teachers",
                label: "Teachers",
                path: "/teachers",
                icon: React.createElement(GraduationCap, { size: 20 }),
                permission: PERMISSIONS.TEACHERS,
            },
            {
                key: "user",
                label: "User Management",
                path: "/user",
                icon: React.createElement(User, { size: 20 }),
                permission: PERMISSIONS.USER_MANAGEMENT,
            },
        ],
    },
    {
        label: "Activity",
        items: [
            {
                key: "attendance",
                label: "Attendance",
                path: "/attendance",
                icon: React.createElement(ClipboardList, { size: 20 }),
                permission: PERMISSIONS.ATTENDANCE,
            },
            {
                key: "tasks",
                label: "Tasks",
                path: "/tasks",
                icon: React.createElement(BookOpen, { size: 20 }),
                permission: PERMISSIONS.TASKS,
            },
            {
                key: "evaluations",
                label: "Evaluations",
                path: "/evaluations",
                icon: React.createElement(Award, { size: 20 }),
                permission: PERMISSIONS.GRADEBOOK,
            },
            {
                key: "events",
                label: "Events",
                path: "/events",
                icon: React.createElement(CalendarDays, { size: 20 }),
                permission: PERMISSIONS.EVENTS,
            },
            {
                key: "messages",
                label: "Messages",
                path: "/conversations",
                icon: React.createElement(MessageSquare, { size: 20 }),
                permission: PERMISSIONS.CHAT,
            },
        ],
    },
];
