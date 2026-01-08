import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { RefreshProvider } from "./context/RefreshContext";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./pages/Dashboard/Dashboard";
import StudentsList from "./pages/Students/StudentsList";
import StudentDetails from "./pages/Students/StudentDetails";
import TeachersList from "./pages/Teachers/TeachersList";
import TeacherDetails from "./pages/Teachers/TeacherDetails";
import Events from "./pages/Events/Events";
import Fees from "./pages/Fees/Fees";
import Reports from "./pages/Reports/Reports";
import Chat from "./pages/Chat/Chat";
import Activity from "./pages/Activity/Activity";
import UserManagement from "./pages/User/UserManagement";
import UserProfile from "./pages/User/UserProfile";
import Settings from "./pages/Settings/Settings";
import Schedule from "./pages/Schedule/Schedule";
import ErrorBoundary from "./components/common/ErrorBoundary";
import "./styles/global.css";
import "./styles/layout.css";

const Layout = ({ children, title }) => {
    return (
        <div className="app-shell">
            <Sidebar />
            <main className="app-main">
                <Topbar pageTitle={title} />
                <ErrorBoundary>
                    <div className="app-content">{children}</div>
                </ErrorBoundary>
            </main>
        </div>
    );
};

export default function App() {
    return (
        <RefreshProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    <Route path="/dashboard" element={
                        <Layout title="Dashboard">
                            <Dashboard />
                        </Layout>
                    } />

                    <Route path="/students" element={
                        <Layout title="Students">
                            <StudentsList />
                        </Layout>
                    } />

                    <Route path="/students/:id" element={
                        <Layout title="Student Details">
                            <StudentDetails />
                        </Layout>
                    } />

                    <Route path="/teachers" element={
                        <Layout title="Teachers">
                            <TeachersList />
                        </Layout>
                    } />

                    <Route path="/teachers/:id" element={
                        <Layout title="Teacher Details">
                            <TeacherDetails />
                        </Layout>
                    } />

                    <Route path="/schedule" element={
                        <Layout title="Schedule">
                            <Schedule />
                        </Layout>
                    } />

                    <Route path="/events" element={
                        <Layout title="Events">
                            <Events />
                        </Layout>
                    } />

                    <Route path="/fees" element={
                        <Layout title="Fees & Invoices">
                            <Fees />
                        </Layout>
                    } />

                    <Route path="/reports" element={
                        <Layout title="Reports & Analytics">
                            <Reports />
                        </Layout>
                    } />

                    <Route path="/activity" element={
                        <Layout title="AI Analyser & Activity">
                            <Activity />
                        </Layout>
                    } />

                    <Route path="/user" element={
                        <Layout title="User Management">
                            <UserManagement />
                        </Layout>
                    } />

                    <Route path="/profile" element={
                        <Layout title="User Profile">
                            <UserProfile />
                        </Layout>
                    } />

                    <Route path="/settings" element={
                        <Layout title="Settings">
                            <Settings />
                        </Layout>
                    } />

                    <Route path="/chat" element={
                        <Layout title="Chat">
                            <Chat />
                        </Layout>
                    } />

                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </Router>
        </RefreshProvider>
    );
}
