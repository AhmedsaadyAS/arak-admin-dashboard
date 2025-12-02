import React, { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./pages/Dashboard/Dashboard";
import StudentsList from "./pages/Students/StudentsList";
import StudentDetails from "./pages/Students/StudentDetails";
import TeachersList from "./pages/Teachers/TeachersList";
import TeacherDetails from "./pages/Teachers/TeacherDetails";
import Events from "./pages/Events/Events";
import Fees from "./pages/Fees/Fees";
import Chat from "./pages/Chat/Chat";
import Activity from "./pages/Activity/Activity";
import UserManagement from "./pages/User/UserManagement";
import UserProfile from "./pages/User/UserProfile";
import Settings from "./pages/Settings/Settings";
import "./styles/global.css";
import "./styles/layout.css";

export default function App() {
    const [active, setActive] = useState("dashboard");
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [selectedTeacherId, setSelectedTeacherId] = useState(null);

    const pageTitles = {
        dashboard: "Dashboard",
        students: "Students",
        teachers: "Teachers",
        events: "Events",
        fees: "Fees & Invoices",
        activity: "AI Analyser & Activity",
        user: "User Management",
        profile: "User Profile",
        settings: "Settings",
        chat: "Chat"
    };

    let content = null;
    switch (active) {
        case "dashboard":
            content = <Dashboard />;
            break;
        case "students":
            content = selectedStudentId
                ? <StudentDetails studentId={selectedStudentId} onBack={() => setSelectedStudentId(null)} />
                : <StudentsList onViewDetails={(id) => setSelectedStudentId(id)} />;
            break;
        case "teachers":
            content = selectedTeacherId
                ? <TeacherDetails teacherId={selectedTeacherId} onBack={() => setSelectedTeacherId(null)} />
                : <TeachersList onViewDetails={(id) => setSelectedTeacherId(id)} />;
            break;
        case "events":
            content = <Events />;
            break;
        case "fees":
            content = <Fees />;
            break;
        case "activity":
            content = <Activity />;
            break;
        case "user":
            content = <UserManagement />;
            break;
        case "profile":
            content = <UserProfile />;
            break;
        case "settings":
            content = <Settings />;
            break;
        case "chat":
            content = <Chat />;
            break;
        default:
            content = <Dashboard />;
    }

    return (
        <div className="app-shell">
            <Sidebar active={active} onSelect={setActive} />
            <main className="app-main">
                <Topbar pageTitle={pageTitles[active] || "Dashboard"} onSelect={setActive} />
                <div className="app-content">{content}</div>
            </main>
        </div>
    );
}
