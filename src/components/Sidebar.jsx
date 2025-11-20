import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import krmuLogo from '../assets/krmu_logo.jpg';
import './Sidebar.css';

const Sidebar = ({ links }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-icon">
          <img src={krmuLogo} alt="KRMU Logo" />
        </div>
        <h2>KRMU</h2>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <h3>{user?.name}</h3>
          <p className="user-role">{user?.role}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link, index) => (
          <NavLink
            key={index}
            to={link.path}
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{link.icon}</span>
            <span className="nav-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="logout-btn" onClick={logout}>
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
