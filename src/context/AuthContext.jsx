import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, extractApiError } from '../services/api';

const AuthContext = createContext({});

const USER_STORAGE_KEY = 'servicehubiq_user';
const TOKEN_STORAGE_KEY = 'token';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setSession = (token, userObj) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userObj));
    setUser(userObj);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  const fetchMe = async () => {
    const response = await authAPI.me();
    return response?.data?.data?.user;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await fetchMe();
        if (!me) throw new Error('No user found');
        setUser(me);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(me));
      } catch {
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            logout();
          }
        } else {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password, role) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (role === 'admin') {
      throw new Error('Admin login is not supported by this backend');
    }

    const response = await authAPI.login({ email, password });
    const token = response?.data?.data?.token;
    const loggedInUser = response?.data?.data?.user;

    if (!token || !loggedInUser) {
      throw new Error('Invalid login response from server');
    }

    if (role && loggedInUser.role !== role) {
      throw new Error(`This account is registered as ${loggedInUser.role}`);
    }

    setSession(token, loggedInUser);
    return loggedInUser;
  };

  const completeOAuthLogin = async (token) => {
    if (!token) {
      throw new Error('OAuth token is missing');
    }

    localStorage.setItem(TOKEN_STORAGE_KEY, token);

    try {
      const me = await fetchMe();
      if (!me) {
        throw new Error('Failed to load user profile');
      }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(me));
      setUser(me);
      return me;
    } catch (error) {
      logout();
      throw error;
    }
  };

  const register = async (userData) => {
    const payload = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      address: userData.address
    };

    const role = userData.userType || 'customer';

    if (role === 'admin') {
      throw new Error('Admin registration is not supported by this backend');
    }

    let response;
    if (role === 'provider') {
      if (!userData.profession) {
        throw new Error('Profession is required for provider registration');
      }
      response = await authAPI.registerProvider({ ...payload, profession: userData.profession });
    } else {
      response = await authAPI.registerCustomer(payload);
    }

    return response?.data?.data?.user;
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  };

  const updateRole = (newRole) => {
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  };

  const value = {
    user,
    login: async (email, password, role) => {
      try {
        return await login(email, password, role);
      } catch (error) {
        throw new Error(extractApiError(error, 'Login failed'));
      }
    },
    completeOAuthLogin: async (token) => {
      try {
        return await completeOAuthLogin(token);
      } catch (error) {
        throw new Error(extractApiError(error, 'OAuth login failed'));
      }
    },
    register: async (payload) => {
      try {
        return await register(payload);
      } catch (error) {
        throw new Error(extractApiError(error, 'Registration failed'));
      }
    },
    logout,
    updateProfile,
    updateRole,
    isAuthenticated: !!user,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
