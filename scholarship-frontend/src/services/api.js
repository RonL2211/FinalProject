// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://localhost:7230/api';

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

// src/services/formService.js
import { api } from './api';

export const formService = {
  // קבלת כל הטפסים
  getAllForms: async () => {
    try {
      const response = await api.get('/Form');
      return response.data;
    } catch (error) {
      console.error('Error fetching forms:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת טפסים');
    }
  },

  // קבלת טופס לפי מזהה
  getFormById: async (id) => {
    try {
      const response = await api.get(`/Form/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching form:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת הטופס');
    }
  },

  // קבלת מבנה טופס (סעיפים ושדות)
  getFormStructure: async (id) => {
    try {
      const response = await api.get(`/Form/${id}/structure`);
      return response.data;
    } catch (error) {
      console.error('Error fetching form structure:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת מבנה הטופס');
    }
  },

  // יצירת טופס חדש (מנהל בלבד)
  createForm: async (formData) => {
    try {
      const response = await api.post('/Form', formData);
      return response.data;
    } catch (error) {
      console.error('Error creating form:', error);
      throw new Error(error.response?.data?.message || 'שגיאה ביצירת הטופס');
    }
  },

  // עדכון טופס (מנהל בלבד)
  updateForm: async (id, formData) => {
    try {
      const response = await api.put(`/Form/${id}`, formData);
      return response.data;
    } catch (error) {
      console.error('Error updating form:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בעדכון הטופס');
    }
  },

  // פרסום טופס (מנהל בלבד)
  publishForm: async (id) => {
    try {
      const response = await api.post(`/Form/${id}/publish`);
      return response.data;
    } catch (error) {
      console.error('Error publishing form:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בפרסום הטופס');
    }
  },

  // וולידציה של טופס (מנהל בלבד)
  validateForm: async (id) => {
    try {
      const response = await api.get(`/Form/validate/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error validating form:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בוולידציה');
    }
  }
};

// src/services/instanceService.js
import { api } from './api';

export const instanceService = {
  // קבלת מופעים של משתמש
  getUserInstances: async (userId) => {
    try {
      const response = await api.get(`/FormInstance/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user instances:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת הטפסים');
    }
  },

  // קבלת מופע לפי מזהה
  getInstanceById: async (id) => {
    try {
      const response = await api.get(`/FormInstance/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching instance:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת המופע');
    }
  },

  // יצירת מופע חדש
  createInstance: async (formId) => {
    try {
      const response = await api.post(`/FormInstance/form/${formId}`);
      return response.data;
    } catch (error) {
      console.error('Error creating instance:', error);
      throw new Error(error.response?.data?.message || 'שגיאה ביצירת המופע');
    }
  },

  // הגשת מופע
  submitInstance: async (id, comments = '') => {
    try {
      const response = await api.post(`/FormInstance/${id}/submit`, {
        comments: comments
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting instance:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בהגשת הטופס');
    }
  },

  // קבלת מופעים לבדיקה (לפי הרשאות)
  getInstancesForReview: async () => {
    try {
      const response = await api.get('/FormInstance/for-review');
      return response.data;
    } catch (error) {
      console.error('Error fetching instances for review:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת טפסים לבדיקה');
    }
  },

  // אישור מופע
  approveInstance: async (id, comments = '') => {
    try {
      const response = await api.post(`/FormInstance/${id}/approve`, {
        comments: comments
      });
      return response.data;
    } catch (error) {
      console.error('Error approving instance:', error);
      throw new Error(error.response?.data?.message || 'שגיאה באישור הטופס');
    }
  },

  // דחיית מופע
  rejectInstance: async (id, comments) => {
    try {
      const response = await api.post(`/FormInstance/${id}/reject`, {
        comments: comments
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting instance:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בדחיית הטופס');
    }
  },

  // שמירת תשובות לשדות
  saveFieldAnswers: async (instanceId, answers) => {
    try {
      const response = await api.post(`/FieldAnswer/instance/${instanceId}/answers`, {
        answers: answers
      });
      return response.data;
    } catch (error) {
      console.error('Error saving field answers:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בשמירת התשובות');
    }
  },

  // קבלת תשובות של מופע
  getInstanceAnswers: async (instanceId) => {
    try {
      const response = await api.get(`/FieldAnswer/instance/${instanceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching instance answers:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת התשובות');
    }
  }
};

// src/services/appealService.js
import { api } from './api';

export const appealService = {
  // יצירת ערעור
  createAppeal: async (instanceId, appealReason) => {
    try {
      const response = await api.post('/Appeal', {
        instanceId: instanceId,
        appealReason: appealReason
      });
      return response.data;
    } catch (error) {
      console.error('Error creating appeal:', error);
      throw new Error(error.response?.data?.message || 'שגיאה ביצירת הערעור');
    }
  },

  // קבלת ערעורים ממתינים (מנהל בלבד)
  getPendingAppeals: async () => {
    try {
      const response = await api.get('/Appeal/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending appeals:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת הערעורים');
    }
  },

  // מענה על ערעור (מנהל בלבד)
  respondToAppeal: async (appealId, isApproved, reviewerResponse) => {
    try {
      const response = await api.post(`/Appeal/${appealId}/respond`, {
        isApproved: isApproved,
        reviewerResponse: reviewerResponse
      });
      return response.data;
    } catch (error) {
      console.error('Error responding to appeal:', error);
      throw new Error(error.response?.data?.message || 'שגיאה במענה על הערעור');
    }
  },

  // קבלת ערעורים של מופע ספציפי
  getInstanceAppeals: async (instanceId) => {
    try {
      const response = await api.get(`/Appeal/instance/${instanceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching instance appeals:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת הערעורים');
    }
  },

  // בדיקה האם ניתן לערער
  canUserAppeal: async (instanceId) => {
    try {
      const response = await api.get(`/Appeal/can-appeal/${instanceId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking appeal eligibility:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בבדיקת זכאות לערעור');
    }
  }
};

// src/services/userService.js
import { api } from './api';

export const userService = {
  // קבלת כל המשתמשים (מנהל בלבד)
  getAllUsers: async () => {
    try {
      const response = await api.get('/Person');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת המשתמשים');
    }
  },

  // קבלת משתמש לפי מזהה
  getUserById: async (id) => {
    try {
      const response = await api.get(`/Person/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת המשתמש');
    }
  },

  // עדכון משתמש
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/Person/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בעדכון המשתמש');
    }
  },

  // קבלת תפקידי משתמש
  getUserRoles: async (id) => {
    try {
      const response = await api.get(`/Person/${id}/roles`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת תפקידי המשתמש');
    }
  },

  // הוספת תפקיד למשתמש (מנהל בלבד)
  assignRole: async (userId, roleId) => {
    try {
      const response = await api.post(`/Person/${userId}/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Error assigning role:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בהקצאת התפקיד');
    }
  },

  // הסרת תפקיד ממשתמש (מנהל בלבד)
  removeRole: async (userId, roleId) => {
    try {
      const response = await api.delete(`/Person/${userId}/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing role:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בהסרת התפקיד');
    }
  }
};