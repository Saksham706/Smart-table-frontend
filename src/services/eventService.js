import axios from 'axios';

const API_URL =  import.meta.env.VITE_API_URL 

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { 
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };
};

const eventService = {
  createEvent: async (eventData) => {
    try {
      const response = await axios.post(`${API_URL}/api/events`, eventData, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  getEvents: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`${API_URL}/api/events?${params}`, getAuthHeader());
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  getEvent: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/api/events/${id}`, getAuthHeader());
      return response.data.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  },

  updateEvent: async (id, eventData) => {
    try {
      const response = await axios.put(`${API_URL}/api/events/${id}`, eventData, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  deleteEvent: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/api/events/${id}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
};

export default eventService;
