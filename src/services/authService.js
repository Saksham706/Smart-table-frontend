import axios from 'axios';

const API_URL =  import.meta.env.VITE_API_URL 

const authService = {
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, userData);
      return response.data.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      return response.data.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  getMe: async () => {
    const token = localStorage.getItem('token');
    
    // ✅ Don't call API if no token
    if (!token) {
      throw new Error('No token found');
    }

    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      console.error('GetMe error:', error);
      throw error;
    }
  }
};

export default authService;
