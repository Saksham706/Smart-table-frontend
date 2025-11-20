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

const timetableService = {
  createTimetable: async (timetableData) => {
    try {
      const response = await axios.post(`${API_URL}/api/timetable`, timetableData, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error creating timetable:', error);
      throw error;
    }
  },

  getStudentTimetable: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/timetable/student`, getAuthHeader());
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching student timetable:', error);
      throw error;
    }
  },

  getTeacherTimetable: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/timetable/teacher`, getAuthHeader());
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching teacher timetable:', error);
      throw error;
    }
  },

  getAllTimetables: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`${API_URL}/api/timetable?${params}`, getAuthHeader());
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching all timetables:', error);
      throw error;
    }
  },

  checkOverlap: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/api/timetable/check-overlap`, data, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error checking overlap:', error);
      throw error;
    }
  },

  updateTimetable: async (id, timetableData) => {
    try {
      const response = await axios.put(`${API_URL}/api/timetable/${id}`, timetableData, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error updating timetable:', error);
      throw error;
    }
  },

  deleteTimetable: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/api/timetable/${id}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error deleting timetable:', error);
      throw error;
    }
  },

  // ✅ Fetch all teachers for reassign modal
  getAllTeachers: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/teachers`, getAuthHeader());
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  },

  // ✅ Reassign class to another teacher
  reassignClass: async ({ timetableId, newTeacherId, mergeType }) => {
    try {
      const response = await axios.post(`${API_URL}/api/timetable/reassign`, {
        timetableId, newTeacherId, mergeType
      }, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error reassigning class:', error);
      throw error;
    }
  }
};

export default timetableService;
