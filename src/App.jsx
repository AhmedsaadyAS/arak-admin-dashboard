import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RefreshProvider } from "./context/RefreshContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Login from "./pages/Auth/Login";
import Unauthorized from "./pages/Auth/Unauthorized";
import Dashboard from "./pages/Dashboard/Dashboard";
import StudentsList from "./pages/Students/StudentsList";
import StudentDetails from "./pages/Students/StudentDetails";
import TeachersList from "./pages/Teachers/TeachersList";
import TeacherDetails from "./pages/Teachers/TeacherDetails";
import GradebookMonitor from "./pages/Evaluations/GradebookMonitor";
import TaskMonitor from "./components/TaskMonitor";
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
import SheetManager from "./components/Control/SheetManager";
import GradesPage from "./pages/Grades/GradesPage";
import { PERMISSIONS } from "./config/permissions"; // Import permissions
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
        <ToastProvider>
            <AuthProvider>
                <RefreshProvider>
                    <Router>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/unauthorized" element={<Unauthorized />} />

                            {/* Protected Routes */}
                            <Route path="/" element={
                                <ProtectedRoute>
                                    <Navigate to="/dashboard" replace />
                                </ProtectedRoute>
                            } />

                            <Route path="/dashboard" element={
                                <ProtectedRoute requiredPermission={PERMISSIONS.DASHBOARD}>
                                    <Layout title="Dashboard">
                                        <Dashboard />
                                    </Layout>
                                </ProtectedRoute>
                            } />

                            <Route path="/students" element={
                                <ProtectedRoute requiredPermission={PERMISSIONS.STUDENTS}>
                                    <Layout title="Students">
                                        <StudentsList />
                                    </Layout>
                                </ProtectedRoute>
                            } />

                            <Route path="/students/:id" element={
                                <ProtectedRoute requiredPermission={PERMISSIONS.STUDENTS}>
                                    <Layout title="Student Details">
                                        <StudentDetails />
                                    </Layout>
                                </ProtectedRoute>
                            } />

                            <Route path="/teachers" element={
                                <ProtectedRoute requiredPermission={PERMISSIONS.TEACHERS}>
                                    <Layout title="Teachers">
                                        <TeachersList />
                                    </Layout>
                                </ProtectedRoute>
                            } />

                            <Route path="/teachers/:id" element={
                                <ProtectedRoute requiredPermission={PERMISSIONS.TEACHERS}>
                                    <Layout title="Teacher Details">
                                        <TeacherDetails />
                                    </Layout>
                                </ProtectedRoute>
                            } />

                            <Route path="/schedule" element={
                                <ProtectedRoute requiredPermission={PERMISSIONS.SCHEDULE}>
                                    <Layout title="Schedule">
                                        <Schedule />
                                    </Layout>
                                </ProtectedRoute>
                            } />

                            <Route path="/events" element={
                                <ProtectedRoute requiredPermission={PERMISSIONS.EVENTS}>
                                    <Layout title="Events">
                                        <Events />
                                    </Layout>
                                </ProtectedRoute>
                            } />

                            <Route path="/fees" element={
                                <ProtectedRoute requiredPermission={PERMISSIONS.FEES}>
                                    <Layout title="Fees & Invoices">
                                        <Fees />
                                    </Layout>
                                </ProtectedRoute>
                            } />

                            <Route path="/reports" element={
                                <ProtectedRoute requiredPermission={PERMISSIONS.REPORTS}>
                                    <Layout title="Reports & Analytics">
                                        <Reports />
                                    </Layout>
                                </ProtectedRoute>
                            } />

                            <Route path="/evaluations" element={
                                <ProtectedRoute requiredPermission={PERMISSIONS.GRADEBOOK}>
                                    <Layout title="Gradebook Monitor">
                                        <GradebookMonitor />
                                    </Layout>
                                </ProtectedRoute>
                            } />

                            <Route path="/tasks" element={
                                <ProtectedRoute requiredPermission={PERMISSIONS.TASKS}>
                                    <Layout title="Task Monitor">
                                        <TaskMonitor />
                                    </Layout>
                                </ProtectedRoute>
                            } />

                            <Route path="/activity" element={
                                <ProtectedRoute requiredPermission={PERMISSIONS.ACTIVITY}>
                                    <Layout title="AI Analyser & Activity">
                                        <Activity />
                                    </Layout>
                                </ProtectedRoute>
                            } />

                            <Route path="/user" element={
                                <ProtectedRoute requiredPermission={PERMISSIONS.USER_MANAGEMENT}>
                                    <Layout title="User Management">
                                        <UserManagement />
                                    </Layout>
                                </ProtectedRoute>
                            } />

                            <Route path="/profile" element={
                                <ProtectedRoute>
                                    <Layout title="User Profile">
                                        <UserProfile />
                                    </Layout>
                                </ProtectedRoute>
                            } />

                            <Route path="/settings" element={
                                <ProtectedRoute requiredPermission={PERMISSIONS.SETTINGS}>
                                    <Layout title="Settings">
                                        <Settings />
                                    </Layout>
                                </ProtectedRoute>
                            } />

                            <Route path="/chat" element={
                                <ProtectedRoute requiredPermission={PERMISSIONS.CHAT}>
                                    <Layout title="Chat">
                                        <Chat />
                                    </Layout>
                                </ProtectedRoute>
                            } />

                            <Route path="/control/sheets" element={
                                <ProtectedRoute requiredPermission={PERMISSIONS.CONTROL_SHEETS}>
                                    <Layout title="Control Sheets">
                                        <SheetManager />
                                    </Layout>
                                </ProtectedRoute>
                            } />

                            <Route path="/grades" element={
                                <ProtectedRoute requiredPermission={PERMISSIONS.GRADES}>
                                    <Layout title="Grades & Classes">
                                        <GradesPage />
                                    </Layout>
                                </ProtectedRoute>
                            } />

                            {/* Fallback route */}
                            <Route path="*" element={
                                <ProtectedRoute>
                                    <Navigate to="/dashboard" replace />
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </Router>
                </RefreshProvider>
            </AuthProvider>
        </ToastProvider>
    );
}
