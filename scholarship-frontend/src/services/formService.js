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