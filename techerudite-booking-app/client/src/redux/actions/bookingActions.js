import {
  GET_BOOKINGS,
  GET_BOOKING,
  CREATE_BOOKING,
  UPDATE_BOOKING,
  DELETE_BOOKING,
  BOOKING_ERROR,
  CHECK_AVAILABILITY,
  CLEAR_BOOKING
} from '../types';
import { setAlert } from './alertActions';
import {
  getBookings as apiGetBookings,
  getBookingById as apiGetBookingById,
  createBooking as apiCreateBooking,
  updateBooking as apiUpdateBooking,
  deleteBooking as apiDeleteBooking,
  checkAvailability as apiCheckAvailability
} from '../../api/api';

// Get all user bookings with pagination
export const getBookings = (page = 1, limit = 10) => async dispatch => {
  try {
    const data = await apiGetBookings(page, limit);
    
    dispatch({
      type: GET_BOOKINGS,
      payload: data
    });
  } catch (err) {
    dispatch({
      type: BOOKING_ERROR,
      payload: err.message
    });
    
    dispatch(setAlert(err.message, 'error'));
  }
};

// Get a single booking by ID
export const getBookingById = (id) => async dispatch => {
  try {
    const data = await apiGetBookingById(id);
    
    dispatch({
      type: GET_BOOKING,
      payload: data
    });
  } catch (err) {
    dispatch({
      type: BOOKING_ERROR,
      payload: err.message
    });
    
    dispatch(setAlert(err.message, 'error'));
  }
};

// Create a new booking
export const createBooking = (bookingData, navigate) => async dispatch => {
  try {
    const data = await apiCreateBooking(bookingData);
    
    dispatch({
      type: CREATE_BOOKING,
      payload: data
    });
    
    dispatch(setAlert('Booking created successfully', 'success'));
    
    // Redirect to booking list if navigate function is provided
    if (navigate) {
      navigate('/bookings');
    }
    
    return true;
  } catch (err) {
    dispatch({
      type: BOOKING_ERROR,
      payload: err.message
    });
    
    dispatch(setAlert(err.message, 'error'));
    
    return false;
  }
};

// Update a booking
export const updateBooking = (id, bookingData, navigate) => async dispatch => {
  try {
    const data = await apiUpdateBooking(id, bookingData);
    
    dispatch({
      type: UPDATE_BOOKING,
      payload: data
    });
    
    dispatch(setAlert('Booking updated successfully', 'success'));
    
    // Redirect to booking list if navigate function is provided
    if (navigate) {
      navigate('/bookings');
    }
    
    return true;
  } catch (err) {
    dispatch({
      type: BOOKING_ERROR,
      payload: err.message
    });
    
    dispatch(setAlert(err.message, 'error'));
    
    return false;
  }
};

// Delete a booking
export const deleteBooking = (id) => async dispatch => {
  if (!window.confirm('Are you sure you want to delete this booking?')) {
    return false;
  }
  
  try {
    await apiDeleteBooking(id);
    
    dispatch({
      type: DELETE_BOOKING,
      payload: id
    });
    
    dispatch(setAlert('Booking deleted successfully', 'success'));
    
    return true;
  } catch (err) {
    dispatch({
      type: BOOKING_ERROR,
      payload: err.message
    });
    
    dispatch(setAlert(err.message, 'error'));
    
    return false;
  }
};

// Check availability for a date
export const checkAvailability = (date) => async dispatch => {
  try {
    const data = await apiCheckAvailability(date);
    
    dispatch({
      type: CHECK_AVAILABILITY,
      payload: data
    });
    
    return data;
  } catch (err) {
    dispatch({
      type: BOOKING_ERROR,
      payload: err.message
    });
    
    dispatch(setAlert('Failed to check availability: ' + err.message, 'error'));
    
    return null;
  }
};

// Clear current booking
export const clearBooking = () => dispatch => {
  dispatch({ type: CLEAR_BOOKING });
}; 