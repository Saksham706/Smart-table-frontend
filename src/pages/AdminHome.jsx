import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, CalendarDays, BookOpen, ClipboardList, UserCheck } from "lucide-react"; 
import "./AdminHome.css"
const API_URL =  import.meta.env.VITE_API_URL;
const AdminHome = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/api/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats(res.data.stats);
      setRecentUsers(res.data.recentUsers);
    } catch (err) {
      console.error("Dashboard Error:", err);
    }
  };

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="dashboard-container">
      <h1 className="dash-title">Dashboard</h1>

      {/* ------------ Stats Grid ------------ */}
      <div className="stats-grid">

        <div className="stat-card">
          <Users size={28} className="stat-icon" />
          <h3>Total Students</h3>
          <p>{stats.totalStudents}</p>
        </div>

        <div className="stat-card">
          <UserCheck size={28} className="stat-icon" />
          <h3>Total Teachers</h3>
          <p>{stats.totalTeachers}</p>
        </div>

        <div className="stat-card">
          <BookOpen size={28} className="stat-icon" />
          <h3>Total Timetables</h3>
          <p>{stats.totalTimetableEntries}</p>
        </div>
        <div className="stat-card">
          <CalendarDays size={28} className="stat-icon" />
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>

      </div>

      {/* ------------ Recent Users Section ------------ */}
      <h2 className="recent-title">Recent Users</h2>

      <div className="recent-users">
        {recentUsers.map((user) => (
          <div key={user._id} className="recent-user-card">
            <strong>{user.name}</strong>
            <span>— {user.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminHome;
