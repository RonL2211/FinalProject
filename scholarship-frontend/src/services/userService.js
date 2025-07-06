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