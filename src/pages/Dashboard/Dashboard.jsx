import React from 'react';
import { Users, GraduationCap, Calendar, MessageCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
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
            <h3 className="stat-value">932</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper icon-orange">
            <GraduationCap size={24} color="white" />
          </div>
          <div className="stat-content">
            <span className="stat-label">Teachers</span>
            <h3 className="stat-value">754</h3>
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
            <div className="chart-legend">
              <span className="legend-item"><span className="dot orange"></span> This Week</span>
              <span className="legend-item"><span className="dot red"></span> Last Week</span>
            </div>
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

        <div className="chart-card school-calendar">
          <div className="card-header">
            <h3>School Calendar</h3>
          </div>
          <div className="calendar-placeholder">
            {/* Simple Calendar Placeholder for now */}
            <div style={{ textAlign: 'center', width: '100%' }}>
              <h4 style={{ marginBottom: '1rem' }}>March 2021</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', fontSize: '0.8rem' }}>
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                <span style={{ color: '#ccc' }}>28</span><span style={{ color: '#ccc' }}>29</span><span style={{ color: '#ccc' }}>30</span><span style={{ color: '#ccc' }}>31</span><span>1</span><span>2</span><span>3</span>
                <span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10</span>
                <span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span>
                <span>18</span><span>19</span><span style={{ background: '#FCC43E', borderRadius: '50%', color: 'white', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>20</span><span>21</span><span>22</span><span>23</span><span>24</span>
              </div>
            </div>
          </div>
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

        <div className="chart-card performance-bar">
          <div className="card-header">
            <h3>Performance</h3>
          </div>
          <div className="chart-container">
            {/* Placeholder for bar chart */}
            <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around' }}>
              <div style={{ width: '20px', height: '60%', background: '#FB7D5B', borderRadius: '10px 10px 0 0' }}></div>
              <div style={{ width: '20px', height: '80%', background: '#FCC43E', borderRadius: '10px 10px 0 0' }}></div>
              <div style={{ width: '20px', height: '40%', background: '#FB7D5B', borderRadius: '10px 10px 0 0' }}></div>
              <div style={{ width: '20px', height: '90%', background: '#FCC43E', borderRadius: '10px 10px 0 0' }}></div>
              <div style={{ width: '20px', height: '50%', background: '#FB7D5B', borderRadius: '10px 10px 0 0' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
