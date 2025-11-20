import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Dashboard from './Dashboard';
import TeacherTimetable from '../components/TeacherTimetable';
import EventManager from '../components/EventManager';
import NotificationSender from '../components/NotificationSender';
import { Home, Calendar, BookOpen, Bell } from 'lucide-react';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const links = [
    { path: '/teacher', label: 'Home', icon: <Home size={20} /> },
    { path: '/teacher/schedule', label: 'My Schedule', icon: <BookOpen size={20} /> },
    { path: '/teacher/events', label: 'Manage Events', icon: <Calendar size={20} /> },
    { path: '/teacher/notifications', label: 'Send Notifications', icon: <Bell size={20} /> }
  ];

  return (
    <div className="dashboard">
      <Sidebar links={links} />
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule" element={<TeacherTimetable />} />
          <Route path="/events" element={<EventManager />} />
          <Route path="/notifications" element={<NotificationSender />} />
        </Routes>
      </div>
    </div>
  );
};

export default TeacherDashboard;
