import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, User, BookOpen, Building, ArrowRight } from 'lucide-react';

import './Login.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    class: '',
    department: '',
    employeeId: '',
    studentId: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await register(formData);
      
      const storedToken = localStorage.getItem('token');
      console.log('Token stored after register:', storedToken ? 'YES' : 'NO');
      
      toast.success('Registration successful! Welcome aboard!');
      
      setTimeout(() => {
        if (data.role === 'student') {
          navigate('/student');
        } else if (data.role === 'teacher') {
          navigate('/teacher');
        } else if (data.role === 'admin') {
          navigate('/admin');
        }
      }, 500);
    } catch (error) {
      console.error('Register error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <div 
            className="auth-icon"
          >

          </div>
          <h1>Create Account</h1>
          <p>Join UnivSync</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              <User size={18} />
              Id / Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your Id and full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <Mail size={18} />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={18} />
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min 6 characters)"
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">
              <User size={18} />
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.role === 'student' && (
            <>
              <div className="form-group">
                <label htmlFor="class">
                  <BookOpen size={18} />
                  Class
                </label>
                <input
                  type="text"
                  id="class"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  placeholder="e.g., CSE-4A, ECE-3B"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="studentId">
                  Student ID
                </label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="Enter your student ID"
                />
              </div>
            </>
          )}

          {(formData.role === 'teacher' || formData.role === 'admin') && (
            <>
              <div className="form-group">
                <label htmlFor="department">
                  <Building size={18} />
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div className="form-group">
                <label htmlFor="employeeId">
                  Employee ID
                </label>
                <input
                  type="text"
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="Enter your employee ID"
                />
              </div>
            </>
          )}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;