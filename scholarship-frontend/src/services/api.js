// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://localhost:7230/api';
// const API_BASE_URL = 'https://proj.ruppin.ac.il/bgroup1/prod/api';
//  const API_BASE_URL = 'https://proj.ruppin.ac.il/bgroup1/test2/tar1/api';

// יצירת instance של axios עם הגדרות בסיס
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// הוספת token אוטומטית
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// טיפול בתגובות
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


