import React, { useState, useContext, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { NotificationContext } from "../contexts/NotificationContext";
import Sidebar from "../components/Sidebar";
import NotificationBar from "../components/NotificationBar";
import Dashboard from "./Dashboard";
import StudentTimetable from "../components/StudentTimetable";
import EventList from "../components/EventList";
import { Home, Calendar, Bell as BellIcon } from "lucide-react";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { unreadCount } = useContext(NotificationContext);

  // 🔥 ADD DARK MODE TO BODY (if you want)
  useEffect(() => {
    document.body.classList.add("dark");
    return () => {
      document.body.classList.remove("dark");
    };
  }, []);

  const links = [
    { path: "/student", label: "Home", icon: <Home size={20} /> },
    { path: "/student/timetable", label: "My Timetable", icon: <Calendar size={20} /> },
    { path: "/student/events", label: "Events", icon: <BellIcon size={20} /> }
  ];

  return (
    <div className="student-dashboard">
      {/* LEFT SIDEBAR */}
      <Sidebar links={links} />

      {/* MAIN CONTENT */}
      <div className="student-main">
        <header className="student-header">
          <h1 className="student-title">UnivSync - Student Dashboard</h1>

          {/* NOTIFICATION BUTTON */}
          <button
            className="student-notification-btn"
            onClick={() => setNotificationOpen(true)}
          >
            <BellIcon size={22} />
            {unreadCount > 0 && (
              <span className="student-notification-badge">{unreadCount}</span>
            )}
          </button>
        </header>

        {/* PAGE CONTENT */}
        <div className="student-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/timetable" element={<StudentTimetable />} />
            <Route path="/events" element={<EventList />} />
          </Routes>
        </div>
      </div>

      {/* NOTIFICATION BAR */}
      <NotificationBar
        isOpen={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />
    </div>
  );
};

export default StudentDashboard;
