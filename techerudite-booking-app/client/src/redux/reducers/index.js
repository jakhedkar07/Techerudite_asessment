import { combineReducers } from 'redux';
import authReducer from './authReducer';
import bookingReducer from './bookingReducer';
import alertReducer from './alertReducer';

export default combineReducers({
  auth: authReducer,
  booking: bookingReducer,
  alert: alertReducer
}); 