import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import krmuLogo from '../assets/logo.png';
import './Login.css';


const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(formData.email, formData.password);
      toast.success('Login successful! Welcome back!');
      
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
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div 
            className="auth-icon"
            style={{
              width: '100px',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '20px',
              boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)',
              padding: '10px'
            }}
          >
            <img 
              src={krmuLogo} 
              alt="KRMU Logo" 
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'contain',
                borderRadius: '16px'
              }}
            />
          </div>
          <h1>Welcome Back!</h1>
          <p>Sign in to your UnivSync</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
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
              autoComplete="email"
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
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
