import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
};

// Service APIs
export const serviceAPI = {
  getAllServices: () => api.get('/services'),
  getServiceById: (id) => api.get(`/services/${id}`),
  bookService: (bookingData) => api.post('/services/book', bookingData),
  cancelBooking: (bookingId) => api.delete(`/services/bookings/${bookingId}`),
  getBookingHistory: () => api.get('/services/bookings'),
};

// Provider APIs
export const providerAPI = {
  getProviderJobs: () => api.get('/provider/jobs'),
  acceptJob: (jobId) => api.post(`/provider/jobs/${jobId}/accept`),
  completeJob: (jobId) => api.post(`/provider/jobs/${jobId}/complete`),
  getEarnings: () => api.get('/provider/earnings'),
};

// Review APIs
export const reviewAPI = {
  submitReview: (reviewData) => api.post('/reviews', reviewData),
  getServiceReviews: (serviceId) => api.get(`/reviews/service/${serviceId}`),
};

export default api;