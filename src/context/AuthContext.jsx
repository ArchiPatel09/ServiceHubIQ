// AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Temporary storage for bookings
  const [bookings, setBookings] = useState(() => {
    const savedBookings = localStorage.getItem('servicehubiq_bookings');
    return savedBookings ? JSON.parse(savedBookings) : [];
  });

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('servicehubiq_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('servicehubiq_user');
      }
    }
    setLoading(false);
  }, []);

  // Save bookings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('servicehubiq_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Enhanced login with validation
  const login = (email, password, role) => {
    // Basic validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    if (!email.includes('@')) {
      throw new Error('Invalid email format');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Mock user data - in real app, this would come from API
    let mockUser;
    if (role === 'customer') {
      mockUser = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: 'customer',
        phone: '+1 (416) 555-0123',
        address: '123 Main St, Toronto, ON',
        token: 'mock-jwt-token',
        joined: new Date().toISOString().split('T')[0]
      };
    } else if (role === 'provider') {
      mockUser = {
        id: '2',
        email,
        name: email.split('@')[0],
        role: 'provider',
        serviceType: 'Plumbing',
        rating: 4.8,
        completedJobs: 42,
        phone: '+1 (416) 555-0123',
        token: 'mock-jwt-token',
        joined: new Date().toISOString().split('T')[0]
      };
    } else if (role === 'admin') {
      mockUser = {
        id: '3',
        email,
        name: 'Admin User',
        role: 'admin',
        token: 'mock-jwt-token',
        permissions: ['users', 'bookings', 'providers', 'analytics'],
        joined: new Date().toISOString().split('T')[0]
      };
    }

    setUser(mockUser);
    localStorage.setItem('servicehubiq_user', JSON.stringify(mockUser));
    
    // Clear any old bookings for new user
    if (role !== 'customer') {
      localStorage.removeItem('servicehubiq_bookings');
    }
    
    return mockUser;
  };

 const register = (userData) => {
  // Registration validation
  const errors = {};
  if (!userData.name) errors.name = 'Name is required';
  if (!userData.email) errors.email = 'Email is required';
  if (!userData.password) errors.password = 'Password is required';
  if (userData.password !== userData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).join(', '));
  }

  // IMPORTANT: Map userType to role
  const newUser = {
    id: Date.now().toString(),
    name: userData.name,
    email: userData.email,
    // password: userData.password,
    phone: userData.phone || '',
    address: userData.address || '',
    role: userData.userType || 'customer', // CRITICAL: Map userType to role
    token: 'mock-jwt-token',
    joined: new Date().toISOString().split('T')[0],
    // Add role-specific data
    ...(userData.userType === 'provider' && {
      serviceType: 'General Service',
      rating: 0,
      completedJobs: 0
    }),
    ...(userData.userType === 'admin' && {
      permissions: ['users', 'bookings', 'providers', 'analytics']
    })
  };

    console.log('Registering user with role:', newUser.role);

  
  // Set user and save to localStorage
  setUser(newUser);
  localStorage.setItem('servicehubiq_user', JSON.stringify(newUser));
  
  return newUser;
};

  const logout = () => {
    setUser(null);
    setBookings([]);
    localStorage.removeItem('servicehubiq_user');
    localStorage.removeItem('servicehubiq_bookings');
  };

  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('servicehubiq_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  // Booking functions
  const addBooking = (bookingData) => {
    const newBooking = {
      id: Date.now().toString(),
      ...bookingData,
      date: new Date().toISOString(),
      status: 'pending'
    };
    
    setBookings(prev => [...prev, newBooking]);
    return newBooking;
  };

  const cancelBooking = (bookingId) => {
    setBookings(prev => prev.filter(booking => booking.id !== bookingId));
  };

  const value = {
    user,
    bookings,
    login,
    register,
    logout,
    updateProfile,
    addBooking,
    cancelBooking,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};