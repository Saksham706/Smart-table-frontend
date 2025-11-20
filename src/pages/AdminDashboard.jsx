import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import AdminHome from './AdminHome';
import TimetableManager from '../components/TimetableManager';
import EventManager from '../components/EventManager';
import NotificationSender from '../components/NotificationSender';

import { Home, Calendar, Users as UsersIcon, Bell, Settings } from 'lucide-react';

import './AdminDashboard.css';

const AdminDashboard = () => {
  const links = [
    { path: '/admin', label: 'Home', icon: <Home size={20} /> },
    { path: '/admin/timetable', label: 'Manage Timetable', icon: <Calendar size={20} /> },
    { path: '/admin/events', label: 'Manage Events', icon: <Bell size={20} /> },
    { path: '/admin/notifications', label: 'Send Notifications', icon: <Settings size={20} /> }
  ];

  return (
    <div className="dashboard">
      <Sidebar links={links} />
      <div className="dashboard-content">
        <Routes>
          <Route index element={<AdminHome />} />
          <Route path="timetable" element={<TimetableManager />} />
          <Route path="events" element={<EventManager />} />
          <Route path="notifications" element={<NotificationSender />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;
