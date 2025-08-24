// src/services/authService.js - מתוקן
import axios from 'axios';

const API_BASE_URL = 'https://localhost:7230/api';

// הגדרת axios עם ברירת מחדל
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// הוספת token לכל בקשה אוטומטית
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

// טיפול בתגובות והפניה ל-login במקרה של 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
      // רק אם לא במסך login כבר
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { api };

// פונקציות אימות
export const login = async (personId, password) => {
  try {
    const response = await api.post('/auth/login', {
      personId: personId.trim(),
      password: password
    });

    const { token, person } = response.data;
    
    if (token && person) {
      // שמירת הטוקן והמשתמש
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(person));
      
      // הגדרת הטוקן ב-axios
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { token, person };
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 
                     error.response.data?.title || 
                     error.response.data || 
                     'שגיאה בהתחברות';
      throw new Error(message);
    } else if (error.request) {
      // Network error
      throw new Error('שגיאת רשת - אין חיבור לשרת');
    } else {
      // Other error
      throw new Error('שגיאה לא צפויה');
    }
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  delete api.defaults.headers.common['Authorization'];
};

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing current user:', error);
    return null;
  }
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  const token = getToken();
  const user = getCurrentUser();
  return !!(token && user);
};

// פונקציות בדיקת הרשאות - מתוקנות!
export const hasRole = (roleName) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // בדיקה אם יש מערך roles
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.some(role => 
      role.roleName === roleName || role.RoleName === roleName
    );
  }
  
  if (user.position) {
    return user.position === roleName;
  }
  
  return false;
};

export const hasAnyRole = (roleNames) => {
  return roleNames.some(roleName => hasRole(roleName));
};

// מיפוי תפקידים לנתיבים - מתוקן עם הרשאות מקרוסות!
export const getRoleBasedRedirect = (user) => {
  if (!user) return '/login';
  
  // בדיקה אם יש מערך roles
  let roles = [];
  if (user.roles && Array.isArray(user.roles)) {
    roles = user.roles.map(r => r.roleName || r.RoleName);
  } else if (user.position) {
    // גיבוי לשדה position
    roles = [user.position];
  }
  
  // סדר עדיפויות - התפקיד הגבוה ביותר קובע דף הבית
  if (roles.includes('מנהל סטודנטים')) {
    return '/manager';
  } else if (roles.includes('דיקאן')) {
    return '/department/submissions'; // דיקאן מתחיל בדפי ניהול פקולטה
  } else if (roles.includes('ראש מחלקה')) {
    return '/department/submissions'; // ראש מחלקה מתחיל בדפי ניהול מחלקה
  } else if (roles.includes('מרצה') || roles.includes('ראש התמחות')) {
    return '/lecturer';
  } else {
    return '/unauthorized';
  }
};

// בדיקת הרשאת גישה לנתיב - מתוקנת!
export const canAccessRoute = (path) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // בדיקה אם יש מערך roles
  let roles = [];
  if (user.roles && Array.isArray(user.roles)) {
    roles = user.roles.map(r => r.roleName || r.RoleName);
  } else if (user.position) {
    // גיבוי לשדה position
    roles = [user.position];
  }
  
  // נתיבים פתוחים
  if (['/login', '/unauthorized'].includes(path)) {
    return true;
  }
  
  // נתיבים לפי תפקידים
  if (path.startsWith('/manager')) {
    return roles.includes('מנהל סטודנטים');
  } else if (path.startsWith('/dean')) {
    return roles.includes('דיקאן');
  } else if (path.startsWith('/dept-head')) {
    return roles.includes('ראש מחלקה');
  } else if (path.startsWith('/lecturer')) {
    return roles.includes('מרצה') || roles.includes('ראש התמחות');
  }
  
  return false;
};

// רענון מידע משתמש
export const refreshUserData = async () => {
  try {
    const user = getCurrentUser();
    if (!user) return null;
    
    const response = await api.get(`/person/${user.personId}`);
    const updatedUser = response.data;
    
    // קבלת התפקידים העדכניים
    const rolesResponse = await api.get(`/person/${user.personId}/roles`);
    updatedUser.roles = rolesResponse.data;
    
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error('Error refreshing user data:', error);
    return null;
  }
};

// בדיקת תוקף טוקן
export const validateToken = async () => {
  try {
    const token = getToken();
    if (!token) return false;
    
    // ניסיון לקבלת נתוני משתמש - אם זה עובד, הטוקן תקף
    const user = getCurrentUser();
    if (!user) return false;
    
    await api.get(`/person/${user.personId}`);
    return true;
  } catch (error) {
    console.error('Token validation failed:', error);
    logout();
    return false;
  }
};