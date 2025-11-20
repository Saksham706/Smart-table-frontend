import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home'; // Public landing page
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="app">
            <Routes>
              {/* Public landing page */}
              <Route path="/" element={<Home />} />

              {/* Authentication pages */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected dashboards */}
              <Route path="/student/*" element={
                <PrivateRoute role="student">
                  <StudentDashboard />
                </PrivateRoute>
              } />
              
              <Route path="/teacher/*" element={
                <PrivateRoute role="teacher">
                  <TeacherDashboard />
                </PrivateRoute>
              } />
              
              <Route path="/admin/*" element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              } />

              {/* Hardcoded demo dashboard (optional, can also protect if needed) */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Fallback: redirect anything unknown to Home */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <ToastContainer 
              position="top-right" 
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
