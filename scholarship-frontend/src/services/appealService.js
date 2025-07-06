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