import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export default {
  getNotifications: async () => {
    const response = await axios.get(`${API_URL}/api/notifications`, getAuthHeader());
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await axios.put(`${API_URL}/api/notifications/${id}/read`, {}, getAuthHeader());
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axios.put(`${API_URL}/api/notifications/read-all`, {}, getAuthHeader());
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await axios.delete(`${API_URL}/api/notifications/${id}`, getAuthHeader());
    return response.data;
  },

  clearReadNotifications: async () => {
    const response = await axios.delete(`${API_URL}/api/notifications/clear-read`, getAuthHeader());
    return response.data;
  }
};
