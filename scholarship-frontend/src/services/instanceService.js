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
  getInstancesByFormId:async (formId) => {
    try {
      const response = await api.get(`/FormInstance/form/${formId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching instances by form ID:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת מופעים לפי מזהה טופס');
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