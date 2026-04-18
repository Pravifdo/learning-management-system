import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

// Upload exam results from Excel file
export const uploadExamResults = async (examId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('examId', examId);

  try {
    const response = await axios.post(
      `${API_URL}/exams/${examId}/upload-results`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get exam results
export const getExamResults = async (examId) => {
  try {
    const response = await axios.get(
      `${API_URL}/exams/${examId}/results`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
