// src/services/userService.js 
import { api } from './api';

export const userService = {
  // קבלת כל המשתמשים עם תפקידים - בקריאה אחת!
  getAllUsersWithRoles: async () => {
    try {  
      // פתרון חלופי: קבל את כל המשתמשים ומפה תפקידים מה-Position
      const response = await api.get('/Person');
      const users = response.data;
      
      // מיפוי Position לרשימת תפקידים
      const positionToRoles = {
        'מרצה': [{ roleID: 1, roleName: 'מרצה' }],
        'ראש התמחות': [{ roleID: 2, roleName: 'ראש התמחות' }],
        'ראש מחלקה': [{ roleID: 3, roleName: 'ראש מחלקה' }],
        'דיקאן': [{ roleID: 4, roleName: 'דיקאן' }],
        'מנהל סטודנטים': [{ roleID: 5, roleName: 'מנהל סטודנטים' }]
      };

      // הוסף תפקידים לכל משתמש על בסיס Position
      const usersWithRoles = users.map(user => ({
        ...user,
        roles: positionToRoles[user.position] || []
      }));

      return usersWithRoles;
    } catch (error) {
      console.error('Error fetching users with roles:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת משתמשים');
    }
  },

  // קבלת כל המשתמשים (ללא תפקידים)
  getAllUsers: async () => {
    try {
      const response = await api.get('/Person');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת משתמשים');
    }
  },

  // קבלת תפקידי משתמש ספציפי - רק כשצריך
  getUserRoles: async (userId) => {
    try {
      const response = await api.get(`/Person/${userId}/roles`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  },

  // קבלת כל המחלקות
  getAllDepartments: async () => {
    try {
      const response = await api.get('/Department');
      return response.data;
    } catch (error) {
      console.error('Error fetching departments:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בטעינת מחלקות');
    }
  },

  // הוספת משתמש
  addUser: async (userData) => {
    try {
      const response = await api.post('/Person', userData);
      return response.data;
    } catch (error) {
      console.error('Error adding user:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בהוספת המשתמש');
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

  // מחיקת משתמש
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/Person/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error(error.response?.data?.message || 'שגיאה במחיקת המשתמש');
    }
  },

  // עדכון תפקידי משתמש
  updateUserRoles: async (userId, roleIds) => {
    try {
      const response = await api.put(`/Person/${userId}/roles`, { roleIds });
      return response.data;
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw new Error(error.response?.data?.message || 'שגיאה בעדכון תפקידים');
    }
  }
};

// פונקציות עזר לניהול משתמשים בקומפוננטה
export const userManagementHelpers = {
  // טעינת נתונים מאופטמת
  loadUsersData: async () => {
    try {
      // טען את כל הנתונים במקביל
      const [departments, usersWithRoles] = await Promise.all([
        userService.getAllDepartments(),
        userService.getAllUsersWithRoles()
      ]);

      const roles = [
        { roleID: 1, roleName: 'מרצה' },
        { roleID: 2, roleName: 'ראש התמחות' },
        { roleID: 3, roleName: 'ראש מחלקה' },
        { roleID: 4, roleName: 'דיקאן' },
        { roleID: 5, roleName: 'מנהל סטודנטים' }
      ];

      return {
        departments,
        users: usersWithRoles,
        roles
      };
    } catch (error) {
      console.error('Error loading users data:', error);
      throw error;
    }
  },

  // טעינת תפקידים למשתמש ספציפי בלבד (לעריכה)
  loadUserRolesForEdit: async (userId) => {
    try {
      const roles = await userService.getUserRoles(userId);
      return roles;
    } catch (error) {
      console.error('Error loading user roles for edit:', error);
      return [];
    }
  }
};