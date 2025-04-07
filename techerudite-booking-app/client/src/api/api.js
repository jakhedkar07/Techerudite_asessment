import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in requests
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

// Helper function to handle API errors
const handleApiError = (error) => {
  // Network or connection error
  if (!error.response) {
    return { message: 'Network error: Unable to connect to server' };
  }
  
  // Server returned an error response
  if (error.response.data && error.response.data.message) {
    return error.response.data;
  }
  
  // Fallback error message based on status code
  switch (error.response.status) {
    case 400:
      return { message: 'Bad request: Please check your input' };
    case 401:
      return { message: 'Unauthorized: Please login again' };
    case 403:
      return { message: 'Forbidden: You do not have permission to access this resource' };
    case 404:
      return { message: 'Not found: The requested resource was not found' };
    case 500:
      return { message: 'Server error: Please try again later' };
    default:
      return { message: `Error: ${error.response.status} - Something went wrong` };
  }
};

// Auth API calls
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await api.get(`/auth/verify/${token}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const resendVerification = async (email) => {
  try {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Booking API calls
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getBookings = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/bookings?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getBookingById = async (id) => {
  try {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateBooking = async (id, bookingData) => {
  try {
    const response = await api.put(`/bookings/${id}`, bookingData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const deleteBooking = async (id) => {
  try {
    const response = await api.delete(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const checkAvailability = async (date) => {
  try {
    const response = await api.get(`/bookings/availability?date=${date}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export default api; 