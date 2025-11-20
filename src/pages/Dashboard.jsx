import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  AlertCircle,
  CalendarDays,
  User,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";
import "./Dashboard.css";
import { useLocation } from "react-router-dom";
const API_URL =  import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const location = useLocation();

  useEffect(() => {
    // GET ROLE FROM URL PATH
    const pathRole = location.pathname.split("/")[1]; // Get "student", "teacher", "admin" from URL
    console.log("Path:", location.pathname);
    console.log("Detected Role from URL:", pathRole);
    
    setUserRole(pathRole);
    fetchDashboardData();
    // eslint-disable-next-line
  }, [location.pathname]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_URL}/api/dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      console.log("Dashboard Data:", data);
      setDashboardData(data);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="db-container">
        <div className="db-loading">
          <div className="db-spinner"></div>
          <p className="db-loading-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="db-container">
        <div className="db-error">
          <AlertCircle size={48} />
          <p className="db-error-text">Failed to load dashboard data</p>
          <button onClick={fetchDashboardData} className="db-btn-retry">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = dashboardData.stats || {};
  const isAdmin = userRole === "admin";
  const isStudent = userRole === "student";
  const isTeacher = userRole === "teacher";

  console.log("=== FINAL RENDER DEBUG ===");
  console.log("userRole:", userRole);
  console.log("isAdmin:", isAdmin);
  console.log("isStudent:", isStudent);
  console.log("isTeacher:", isTeacher);
  console.log("Stats:", stats);
  console.log("==========================");

  return (
    <div className="db-container">
      <div className="db-header">
        <h1 className="db-title">Dashboard</h1>
        <p className="db-subtitle">Welcome to your smart notification system</p>
      </div>

      {/* MAIN STAT CARDS */}
      <div className="db-stats-grid">
        {isAdmin && (
          <>
            <DBStatCard
              icon={<Users size={32} />}
              title="Total Students"
              value={stats.totalStudents ?? "N/A"}
              color="#6366f1"
            />
            <DBStatCard
              icon={<User size={32} />}
              title="Total Teachers"
              value={stats.totalTeachers ?? "N/A"}
              color="#8b5cf6"
            />
            <DBStatCard
              icon={<FileText size={32} />}
              title="Total Admins"
              value={stats.totalAdmins ?? "N/A"}
              color="#ec4899"
            />
            <DBStatCard
              icon={<TrendingUp size={32} />}
              title="Total Users"
              value={stats.totalUsers ?? "N/A"}
              color="#f59e0b"
            />
            <DBStatCard
              icon={<BookOpen size={32} />}
              title="Timetable Entries"
              value={stats.totalTimetableEntries ?? "N/A"}
              color="#34d399"
            />
          </>
        )}

        {isStudent && (
          <>
            <DBStatCard
              icon={<BookOpen size={32} />}
              title="Total Classes"
              value={stats.totalClasses ?? 0}
              color="#6366f1"
            />
            <DBStatCard
              icon={<FileText size={32} />}
              title="Total Subjects"
              value={stats.totalSubjects ?? 0}
              color="#8b5cf6"
            />
            <DBStatCard
              icon={<CalendarDays size={32} />}
              title="Today's Classes"
              value={stats.todaysClasses ?? 0}
              color="#ec4899"
            />
            <DBStatCard
              icon={<Clock size={32} />}
              title="This Week Classes"
              value={stats.thisWeekClasses ?? 0}
              color="#f59e0b"
            />
          </>
        )}

        {isTeacher && (
          <>
            <DBStatCard
              icon={<BookOpen size={32} />}
              title="Total Classes"
              value={stats.totalClasses ?? 0}
              color="#6366f1"
            />
            <DBStatCard
              icon={<CalendarDays size={32} />}
              title="Today's Schedule"
              value={stats.todaysClasses ?? 0}
              color="#f59e0b"
            />
          </>
        )}
      </div>

      {/* MAIN GRID */}
      <div className="db-main-grid">
        {!isAdmin ? (
          <>
            {/* STUDENT / TEACHER SCHEDULE */}
            <div className="db-card db-card-schedule">
              <h2 className="db-card-title">Today's Schedule</h2>
              <div className="db-schedule-list">
                {dashboardData.todaysSchedule?.length ? (
                  dashboardData.todaysSchedule.map((item, idx) => (
                    <div key={idx} className="db-schedule-item">
                      <div className="db-schedule-time">
                        <Clock size={20} />
                        <span className="db-schedule-time-text">{item.startTime}</span>
                      </div>
                      <div className="db-schedule-details">
                        <p className="db-schedule-title">{item.subject}</p>
                        <p className="db-schedule-location">{item.location}</p>
                        <p className="db-schedule-meta">{item.day}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="db-schedule-none">No scheduled classes today.</div>
                )}
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="db-card db-card-quick">
              <h2 className="db-card-title">Quick Stats</h2>
              <div className="db-quick-list">
                {isStudent && (
                  <>
                    <DBQuickStat
                      label="Classes This Week"
                      value={stats.thisWeekClasses ?? 0}
                      icon="📅"
                    />
                    <DBQuickStat
                      label="Subjects"
                      value={stats.totalSubjects ?? 0}
                      icon="📖"
                    />
                  </>
                )}

                {isTeacher && (
                  <>
                    <DBQuickStat
                      label="Classes Assigned"
                      value={stats.totalClasses ?? 0}
                      icon="📚"
                    />
                  </>
                )}

                {!isStudent && !isTeacher && (
                  <div className="db-quick-none">No stats available for your role</div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="db-card db-card-schedule">
              <h2 className="db-card-title">Recent Users</h2>
              <div className="db-schedule-list">
                {dashboardData.recentUsers?.length ? (
                  dashboardData.recentUsers.map((user, idx) => (
                    <div key={idx} className="db-schedule-item">
                      <div className="db-schedule-time">
                        <User size={20} />
                      </div>
                      <div className="db-schedule-details">
                        <p className="db-schedule-title">{user.name}</p>
                        <p className="db-schedule-location">{user.email}</p>
                        <p className="db-schedule-meta">{user.role}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="db-schedule-none">No recent users</div>
                )}
              </div>
            </div>

            <div className="db-card db-card-quick">
              <h2 className="db-card-title">Quick Stats</h2>
              <div className="db-quick-list">
                <DBQuickStat
                  label="Total Students"
                  value={stats.totalStudents ?? 0}
                  icon="🎓"
                />
                <DBQuickStat
                  label="Total Teachers"
                  value={stats.totalTeachers ?? 0}
                  icon="👨‍🏫"
                />
                <DBQuickStat
                  label="Total Admins"
                  value={stats.totalAdmins ?? 0}
                  icon="🛡️"
                />
                <DBQuickStat
                  label="Timetable Entries"
                  value={stats.totalTimetableEntries ?? 0}
                  icon="📚"
                />
                <DBQuickStat
                  label="Departments"
                  value={dashboardData.departments?.length ?? 0}
                  icon="🏢"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ADMIN DEPARTMENTS */}
      {isAdmin && (
        <div className="db-card db-card-dept">
          <h2 className="db-card-title">Departments</h2>
          <div className="db-dept-list">
            {dashboardData.departments?.length ? (
              dashboardData.departments.map((dept, idx) => (
                <div key={idx} className="db-dept-badge">
                  {dept || "Unassigned"}
                </div>
              ))
            ) : (
              <div className="db-dept-none">No Departments</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DBStatCard = ({ icon, title, value, color }) => (
  <div className="db-stat-card" style={{ borderLeftColor: color }}>
    <div className="db-stat-icon" style={{ color }}>
      {icon}
    </div>
    <div className="db-stat-content">
      <h3 className="db-stat-title">{title}</h3>
      <p className="db-stat-value">{value}</p>
    </div>
  </div>
);

const DBQuickStat = ({ label, value, icon }) => (
  <div className="db-quick-item">
    <span className="db-quick-icon">{icon}</span>
    <div>
      <p className="db-quick-label">{label}</p>
      <p className="db-quick-value">{value}</p>
    </div>
  </div>
);

export default Dashboard;
