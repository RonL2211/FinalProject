// src/context/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  getCurrentUser, 
  getToken, 
  logout as authLogout, 
  validateToken,
  getRoleBasedRedirect 
} from '../services/authService';

// יצירת Context
const AuthContext = createContext();

// Action Types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  UPDATE_USER: 'UPDATE_USER'
};

// Initial State
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
      
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
      
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      };
      
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
      
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
      
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload.user
      };
      
    default:
      return state;
  }
};

// Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // בדיקת אימות בטעינת האפליקציה
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      try {
        const token = getToken();
        const user = getCurrentUser();
        
        if (token && user) {
          // בדיקת תוקף הטוקן
          const isValid = await validateToken();
          
          if (isValid) {
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: { user, token }
            });
          } else {
            // טוקן לא תקף - ניקוי
            authLogout();
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authLogout();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      } finally {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // פונקציות לשימוש ברכיבים
  const login = async (personId, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const { login: authLogin } = await import('../services/authService');
      const result = await authLogin(personId, password);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: result.person,
          token: result.token
        }
      });
      
      return result;
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: error.message }
      });
      throw error;
    }
  };

  const logout = () => {
    authLogout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const updateUser = (updatedUser) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: { user: updatedUser }
    });
  };

  const clearError = () => {
    dispatch({
      type: AUTH_ACTIONS.LOGIN_FAILURE,
      payload: { error: null }
    });
  };

  // בדיקות הרשאות - מתוקנות!
  const hasRole = (roleName) => {
    if (!state.user) return false;
    
    // בדיקה אם יש מערך roles
    if (state.user.roles && Array.isArray(state.user.roles)) {
      return state.user.roles.some(role => 
        (role.roleName === roleName) || (role.RoleName === roleName)
      );
    }
    
    // גיבוי לבדיקת position (לתמיכה לאחור)
    if (state.user.position) {
      return state.user.position === roleName;
    }
    
    return false;
  };

  const hasAnyRole = (roleNames) => {
    return roleNames.some(roleName => hasRole(roleName));
  };

  const canAccess = (requiredRoles) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return hasAnyRole(requiredRoles);
  };

  const getDefaultRoute = () => {
    return getRoleBasedRedirect(state.user);
  };

  // Context Value
  const value = {
    // State
    ...state,
    
    // Actions
    login,
    logout,
    updateUser,
    clearError,
    
    // Utilities
    hasRole,
    hasAnyRole,
    canAccess,
    getDefaultRoute
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook לשימוש ב-Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};

export default AuthContext;