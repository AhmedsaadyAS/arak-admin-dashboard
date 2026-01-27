import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, Calendar, MessageCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { api } from '../../services/api';
import ClassDistributionChart from '../../components/Dashboard/ClassDistributionChart';
import StudentsPerTeacherChart from '../../components/Dashboard/StudentsPerTeacherChart';
import './dashboard.css';

const performanceData = [
  { name: 'Jan', thisWeek: 30, lastWeek: 20 },
  { name: 'Feb', thisWeek: 45, lastWeek: 30 },
  { name: 'Mar', thisWeek: 75, lastWeek: 50 },
  { name: 'Apr', thisWeek: 50, lastWeek: 35 },
  { name: 'May', thisWeek: 40, lastWeek: 25 },
  { name: 'Jun', thisWeek: 60, lastWeek: 45 },
  { name: 'Jul', thisWeek: 80, lastWeek: 60 },
  { name: 'Aug', thisWeek: 70, lastWeek: 55 },
  { name: 'Sep', thisWeek: 55, lastWeek: 40 },
  { name: 'Oct', thisWeek: 90, lastWeek: 75 },
  { name: 'Nov', thisWeek: 85, lastWeek: 70 },
  { name: 'Dec', thisWeek: 70, lastWeek: 60 },
];

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch ALL students for analytics (using large limit)
        const stuRes = await api.getStudents({ _limit: 200 });
        const teaRes = await api.getTeachers({ _limit: 50 });
        setStudents(stuRes.data || []);
        setTeachers(teaRes || []); // getTeachers returns array directly in api.js currently? Double check api.js
      } catch (error) {
        console.error("Dashboard verify failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="dashboard-page">
      {/* Stats Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-blue">
            <Users size={24} color="white" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Students</span>
            <h3 className="stat-value">{students.length}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper icon-orange">
            <GraduationCap size={24} color="white" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Teachers</span>
            <h3 className="stat-value">{teachers.length}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper icon-yellow">
            <Calendar size={24} color="white" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Events</span>
            <h3 className="stat-value">40</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper icon-dark">
            <MessageCircle size={24} color="white" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Messages</span>
            <h3 className="stat-value">32</h3>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <div className="chart-card school-performance">
          <div className="card-header">
            <h3>School Performance</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorThisWeek" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB7D5B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FB7D5B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLastWeek" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FCC43E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FCC43E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A098AE' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A098AE' }} />
                <Tooltip />
                <Area type="monotone" dataKey="thisWeek" stroke="#FB7D5B" strokeWidth={3} fillOpacity={1} fill="url(#colorThisWeek)" />
                <Area type="monotone" dataKey="lastWeek" stroke="#FCC43E" strokeWidth={3} fillOpacity={1} fill="url(#colorLastWeek)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Replaced High Risk List with Students Per Teacher Chart */}
        <div className="chart-card high-risk-students" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'none' }}>
          <StudentsPerTeacherChart students={students} teachers={teachers} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-grid">
        <div className="chart-card attendance-list">
          <div className="card-header">
            <h3>Attendance List</h3>
          </div>
          <table className="simple-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Samantha William</td>
                <td>#123456789</td>
                <td>March 25, 2021</td>
                <td><span className="badge success">Present</span></td>
              </tr>
              <tr>
                <td>Tony Soap</td>
                <td>#123456789</td>
                <td>March 25, 2021</td>
                <td><span className="badge warning">Late</span></td>
              </tr>
              <tr>
                <td>Karen Hope</td>
                <td>#123456789</td>
                <td>March 25, 2021</td>
                <td><span className="badge danger">Absent</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="chart-card performance-bar" style={{ padding: 0, overflow: 'hidden', border: 'none', boxShadow: 'none' }}>
          <ClassDistributionChart students={students} />
        </div>
      </div>
    </div>
  );
}
