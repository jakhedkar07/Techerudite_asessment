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

const initialState = {
  bookings: [],
  booking: null,
  loading: true,
  error: null,
  pagination: null,
  availability: null
};

const bookingReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case GET_BOOKINGS:
      return {
        ...state,
        bookings: payload.bookings,
        pagination: payload.pagination,
        loading: false
      };
    case GET_BOOKING:
      return {
        ...state,
        booking: payload,
        loading: false
      };
    case CREATE_BOOKING:
      return {
        ...state,
        bookings: [payload.booking, ...state.bookings],
        loading: false
      };
    case UPDATE_BOOKING:
      return {
        ...state,
        bookings: state.bookings.map(booking => 
          booking._id === payload.booking._id ? payload.booking : booking
        ),
        booking: payload.booking,
        loading: false
      };
    case DELETE_BOOKING:
      return {
        ...state,
        bookings: state.bookings.filter(booking => booking._id !== payload),
        loading: false
      };
    case CHECK_AVAILABILITY:
      return {
        ...state,
        availability: payload,
        loading: false
      };
    case CLEAR_BOOKING:
      return {
        ...state,
        booking: null
      };
    case BOOKING_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
};

export default bookingReducer; 