import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  USER_LOADED,
  AUTH_ERROR,
  VERIFY_EMAIL_SUCCESS,
  VERIFY_EMAIL_FAIL,
  RESEND_VERIFICATION_SUCCESS,
  RESEND_VERIFICATION_FAIL
} from '../types';
import { setAlert } from './alertActions';
import {
  registerUser as apiRegisterUser,
  loginUser as apiLoginUser,
  verifyEmail as apiVerifyEmail,
  resendVerification as apiResendVerification,
  getCurrentUser as apiGetCurrentUser,
  logout as apiLogout
} from '../../api/api';

// Register User
export const register = (userData) => async dispatch => {
  try {
    const data = await apiRegisterUser(userData);
    
    dispatch({
      type: REGISTER_SUCCESS
    });
    
    dispatch(setAlert(data.message, 'success'));
  } catch (err) {
    const message = err.message || 'Registration failed';
    
    dispatch({
      type: REGISTER_FAIL,
      payload: message
    });
    
    dispatch(setAlert(message, 'error'));
  }
};

// Login User
export const login = (email, password) => async dispatch => {
  try {
    const data = await apiLoginUser({ email, password });
    
    dispatch({
      type: LOGIN_SUCCESS,
      payload: data
    });
    
    dispatch(loadUser());
  } catch (err) {
    const message = err.message || 'Login failed';
    
    dispatch({
      type: LOGIN_FAIL,
      payload: message
    });
    
    dispatch(setAlert(message, 'error'));
  }
};

// Verify Email
export const verifyEmail = (token) => async dispatch => {
  try {
    const data = await apiVerifyEmail(token);
    
    dispatch({
      type: VERIFY_EMAIL_SUCCESS
    });
    
    dispatch(setAlert(data.message, 'success'));
    
    return true;
  } catch (err) {
    const message = err.message || 'Email verification failed';
    
    dispatch({
      type: VERIFY_EMAIL_FAIL,
      payload: message
    });
    
    dispatch(setAlert(message, 'error'));
    
    return false;
  }
};

// Resend Verification Email
export const resendVerification = (email) => async dispatch => {
  try {
    const data = await apiResendVerification(email);
    
    dispatch({
      type: RESEND_VERIFICATION_SUCCESS
    });
    
    dispatch(setAlert(data.message, 'success'));
  } catch (err) {
    const message = err.message || 'Failed to resend verification email';
    
    dispatch({
      type: RESEND_VERIFICATION_FAIL,
      payload: message
    });
    
    dispatch(setAlert(message, 'error'));
  }
};

// Load User
export const loadUser = () => async dispatch => {
  try {
    const data = await apiGetCurrentUser();
    
    dispatch({
      type: USER_LOADED,
      payload: data
    });
  } catch (err) {
    dispatch({
      type: AUTH_ERROR,
      payload: err.message
    });
  }
};

// Logout
export const logout = () => dispatch => {
  apiLogout();
  
  dispatch({
    type: LOGOUT
  });
  
  dispatch(setAlert('You have been logged out', 'info'));
}; 