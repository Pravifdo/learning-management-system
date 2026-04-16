import axios from 'axios';

const API_URL = 'http://localhost:4000/api/exams';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('authToken');
};

// Create axios instance with headers
const createAxiosInstance = () => {
  const token = getToken();
  return axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get all exams
export const getAllExams = async () => {
  try {
    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.get('/');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching exams:', error);
    throw error;
  }
};

// Get exam by ID
export const getExamById = async (id) => {
  try {
    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.get(`/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching exam:', error);
    throw error;
  }
};

// Create exam
export const createExam = async (examData) => {
  try {
    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.post('/', examData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating exam:', error);
    throw error;
  }
};

// Update exam
export const updateExam = async (id, examData) => {
  try {
    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.put(`/${id}`, examData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating exam:', error);
    throw error;
  }
};

// Delete exam
export const deleteExam = async (id) => {
  try {
    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.delete(`/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error deleting exam:', error);
    throw error;
  }
};

// Get exams by subject
export const getExamsBySubject = async (subject) => {
  try {
    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.get(`/subject/${subject}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching exams by subject:', error);
    throw error;
  }
};
