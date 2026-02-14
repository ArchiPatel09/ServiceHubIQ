import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const currentPath = window?.location?.pathname || '';

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('servicehubiq_user');

      if (currentPath !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const extractApiError = (error, fallback = 'Something went wrong') => {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

export const authAPI = {
  registerCustomer: (userData) => api.post('/auth/register/customer', userData),
  registerProvider: (userData) => api.post('/auth/register/provider', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  me: () => api.get('/auth/me'),
  googleLoginUrl: () => `${API_BASE_URL}/auth/google`
};

export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getCustomerBookings: () => api.get('/bookings/customer'),
  getProviderBookings: () => api.get('/bookings/provider'),
  updateBookingStatus: (bookingId, status) => api.patch(`/bookings/${bookingId}/status`, { status })
};

export const userAPI = {
  getProviders: (profession) => api.get('/users/providers', { params: profession ? { profession } : undefined })
};

export default api;
