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
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
  me: () => api.get('/auth/me'),
  googleLoginUrl: (role, service) => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (service) params.append('service', service);
    const query = params.toString();
    return `${API_BASE_URL}/auth/google${query ? `?${query}` : ''}`;
  }
};

export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getCustomerBookings: () => api.get('/bookings/customer'),
  getProviderBookings: () => api.get('/bookings/provider'),
  updateBookingStatus: (bookingId, status) => api.patch(`/bookings/${bookingId}/status`, { status }),
  submitReview: (bookingId, payload) => api.patch(`/bookings/${bookingId}/review`, payload)
};

export const userAPI = {
  getProviders: (service, location) =>
    api.get('/users/providers', { params: { ...(service ? { service } : {}), ...(location ? { location } : {}) } }),
  getMe: () => api.get('/users/me'),
  updateMe: (payload) => api.put('/users/me', payload)
};

export const providerAPI = {
  getMe: () => api.get('/providers/me'),
  updateMe: (payload) => api.put('/providers/me', payload)
};

// Task 4 - Provider Rating System
export const ratingAPI = {
  // Customer submits or updates a rating for their completed booking
  submitRating: (payload) => api.post('/ratings', payload),
  // Provider fetches their own aggregated rating profile (dashboard)
  getMyRatingProfile: () => api.get('/ratings/my-profile'),
  // Public - fetch any provider's stats (used on service cards)
  getProviderStats: (providerId) => api.get(`/ratings/provider/${providerId}/stats`),
  // Public - fetch a provider's recent reviews
  getProviderReviews: (providerId, limit = 10) =>
    api.get(`/ratings/provider/${providerId}/reviews`, { params: { limit } })
};

// Task 8 - Admin APIs
export const adminAPI = {
  getMetrics: () => api.get('/admin/metrics'),
  getUsers: (role) => api.get('/admin/users', { params: role ? { role } : {} }),
  getProviders: () => api.get('/admin/providers'),
  createAdmin: (payload) => api.post('/admin/users/admins', payload),
  suspendUser: (userId, isSuspended) => api.patch(`/admin/users/${userId}/suspend`, { isSuspended }),
  approveProvider: (providerId, isProviderApproved) => api.patch(`/admin/providers/${providerId}/approve`, { isProviderApproved }),
  verifyProvider: (providerId, isProviderVerified) => api.patch(`/admin/providers/${providerId}/verify`, { isProviderVerified }),
  getBookings: () => api.get('/admin/bookings'),
  cancelBooking: (bookingId) => api.patch(`/admin/bookings/${bookingId}/cancel`),
  getRatings: () => api.get('/admin/ratings'),
  removeRating: (ratingId) => api.patch(`/admin/ratings/${ratingId}/remove`)
};

export default api;
