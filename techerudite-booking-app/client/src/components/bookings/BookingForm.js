import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  MenuItem,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { format, setHours, setMinutes } from 'date-fns';
import {
  createBooking,
  getBookingById,
  updateBooking,
  checkAvailability,
  clearBooking
} from '../../redux/actions/bookingActions';

// Validation schema
const BookingSchema = Yup.object().shape({
  customerName: Yup.string()
    .required('Customer name is required'),
  customerEmail: Yup.string()
    .email('Invalid email')
    .required('Customer email is required'),
  bookingDate: Yup.date()
    .required('Booking date is required'),
  bookingType: Yup.string()
    .oneOf(['Full Day', 'Half Day', 'Custom'], 'Invalid booking type')
    .required('Booking type is required'),
  bookingSlot: Yup.string()
    .when('bookingType', {
      is: 'Half Day',
      then: Yup.string()
        .oneOf(['First Half', 'Second Half'], 'Invalid booking slot')
        .required('Booking slot is required for Half Day bookings'),
      otherwise: Yup.string().nullable()
    }),
  bookingTimeFrom: Yup.date()
    .when('bookingType', {
      is: 'Custom',
      then: Yup.date().required('Start time is required for Custom bookings'),
      otherwise: Yup.date().nullable()
    }),
  bookingTimeTo: Yup.date()
    .when('bookingType', {
      is: 'Custom',
      then: Yup.date()
        .required('End time is required for Custom bookings')
        .min(
          Yup.ref('bookingTimeFrom'),
          'End time must be after start time'
        ),
      otherwise: Yup.date().nullable()
    })
});

const BookingForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { booking, loading, availability } = useSelector(state => state.booking);
  const [isEdit, setIsEdit] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Initial form values
  const initialValues = {
    customerName: '',
    customerEmail: '',
    bookingDate: new Date(),
    bookingType: 'Full Day',
    bookingSlot: '',
    bookingTimeFrom: setHours(setMinutes(new Date(), 0), 9),
    bookingTimeTo: setHours(setMinutes(new Date(), 0), 10)
  };

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      dispatch(getBookingById(id));
    } else {
      dispatch(clearBooking());
    }
  }, [dispatch, id]);

  // Check availability when date changes
  const handleDateChange = async (date, setFieldValue) => {
    setFieldValue('bookingDate', date);

    setCheckingAvailability(true);
    const availabilityData = await dispatch(checkAvailability(format(date, 'yyyy-MM-dd')));
    setCheckingAvailability(false);

    // Reset booking type if current selection is not available
    if (availabilityData) {
      const { availability } = availabilityData;
      
      // If full day is not available, check half day options
      if (!availability.fullDay && setFieldValue.values.bookingType === 'Full Day') {
        if (availability.firstHalf) {
          setFieldValue('bookingType', 'Half Day');
          setFieldValue('bookingSlot', 'First Half');
        } else if (availability.secondHalf) {
          setFieldValue('bookingType', 'Half Day');
          setFieldValue('bookingSlot', 'Second Half');
        } else {
          setFieldValue('bookingType', 'Custom');
        }
      }
      
      // If half day slot is not available, try another slot or custom
      if (setFieldValue.values.bookingType === 'Half Day') {
        if (setFieldValue.values.bookingSlot === 'First Half' && !availability.firstHalf) {
          if (availability.secondHalf) {
            setFieldValue('bookingSlot', 'Second Half');
          } else {
            setFieldValue('bookingType', 'Custom');
            setFieldValue('bookingSlot', '');
          }
        } else if (setFieldValue.values.bookingSlot === 'Second Half' && !availability.secondHalf) {
          if (availability.firstHalf) {
            setFieldValue('bookingSlot', 'First Half');
          } else {
            setFieldValue('bookingType', 'Custom');
            setFieldValue('bookingSlot', '');
          }
        }
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Format the date and time values for API
      const formattedValues = {
        ...values,
        bookingDate: format(values.bookingDate, 'yyyy-MM-dd')
      };
      
      // For custom bookings, format the time values
      if (values.bookingType === 'Custom' && values.bookingTimeFrom && values.bookingTimeTo) {
        const bookingDate = new Date(values.bookingDate);
        
        const timeFrom = new Date(values.bookingTimeFrom);
        const timeTo = new Date(values.bookingTimeTo);
        
        // Set the date part of the time values to the booking date
        const formattedTimeFrom = new Date(bookingDate);
        formattedTimeFrom.setHours(timeFrom.getHours(), timeFrom.getMinutes(), 0, 0);
        
        const formattedTimeTo = new Date(bookingDate);
        formattedTimeTo.setHours(timeTo.getHours(), timeTo.getMinutes(), 0, 0);
        
        formattedValues.bookingTimeFrom = formattedTimeFrom.toISOString();
        formattedValues.bookingTimeTo = formattedTimeTo.toISOString();
      }
      
      let success;
      if (isEdit) {
        success = await dispatch(updateBooking(id, formattedValues, navigate));
      } else {
        success = await dispatch(createBooking(formattedValues, navigate));
      }
      
      if (success) {
        navigate('/bookings');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {isEdit ? 'Edit Booking' : 'Create New Booking'}
        </Typography>
        
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Formik
            initialValues={isEdit && booking ? {
              customerName: booking.customerName,
              customerEmail: booking.customerEmail,
              bookingDate: new Date(booking.bookingDate),
              bookingType: booking.bookingType,
              bookingSlot: booking.bookingSlot || '',
              bookingTimeFrom: booking.bookingTimeFrom ? new Date(booking.bookingTimeFrom) : null,
              bookingTimeTo: booking.bookingTimeTo ? new Date(booking.bookingTimeTo) : null
            } : initialValues}
            validationSchema={BookingSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, values, setFieldValue, isSubmitting }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      name="customerName"
                      label="Customer Name"
                      fullWidth
                      variant="outlined"
                      error={touched.customerName && Boolean(errors.customerName)}
                      helperText={touched.customerName && errors.customerName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      name="customerEmail"
                      label="Customer Email"
                      fullWidth
                      variant="outlined"
                      error={touched.customerEmail && Boolean(errors.customerEmail)}
                      helperText={touched.customerEmail && errors.customerEmail}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Booking Date"
                      value={values.bookingDate}
                      onChange={(date) => handleDateChange(date, setFieldValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          variant="outlined"
                          error={touched.bookingDate && Boolean(errors.bookingDate)}
                          helperText={touched.bookingDate && errors.bookingDate}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {checkingAvailability && <CircularProgress size={20} />}
                                {params.InputProps.endAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl 
                      fullWidth 
                      variant="outlined"
                      error={touched.bookingType && Boolean(errors.bookingType)}
                    >
                      <InputLabel>Booking Type</InputLabel>
                      <Field
                        as={Select}
                        name="bookingType"
                        label="Booking Type"
                      >
                        <MenuItem value="Full Day" disabled={availability && !availability.availability?.fullDay}>
                          Full Day
                        </MenuItem>
                        <MenuItem value="Half Day">Half Day</MenuItem>
                        <MenuItem value="Custom">Custom</MenuItem>
                      </Field>
                      {touched.bookingType && errors.bookingType && (
                        <FormHelperText>{errors.bookingType}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  
                  {values.bookingType === 'Half Day' && (
                    <Grid item xs={12}>
                      <FormControl 
                        fullWidth 
                        variant="outlined"
                        error={touched.bookingSlot && Boolean(errors.bookingSlot)}
                      >
                        <InputLabel>Booking Slot</InputLabel>
                        <Field
                          as={Select}
                          name="bookingSlot"
                          label="Booking Slot"
                        >
                          <MenuItem 
                            value="First Half"
                            disabled={availability && !availability.availability?.firstHalf}
                          >
                            First Half (Morning)
                          </MenuItem>
                          <MenuItem 
                            value="Second Half"
                            disabled={availability && !availability.availability?.secondHalf}
                          >
                            Second Half (Afternoon)
                          </MenuItem>
                        </Field>
                        {touched.bookingSlot && errors.bookingSlot && (
                          <FormHelperText>{errors.bookingSlot}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  )}
                  
                  {values.bookingType === 'Custom' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TimePicker
                          label="From Time"
                          value={values.bookingTimeFrom}
                          onChange={(time) => setFieldValue('bookingTimeFrom', time)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="outlined"
                              error={touched.bookingTimeFrom && Boolean(errors.bookingTimeFrom)}
                              helperText={touched.bookingTimeFrom && errors.bookingTimeFrom}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TimePicker
                          label="To Time"
                          value={values.bookingTimeTo}
                          onChange={(time) => setFieldValue('bookingTimeTo', time)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              fullWidth
                              variant="outlined"
                              error={touched.bookingTimeTo && Boolean(errors.bookingTimeTo)}
                              helperText={touched.bookingTimeTo && errors.bookingTimeTo}
                            />
                          )}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
                
                <Box mt={4} display="flex" justifyContent="space-between">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/bookings')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting || loading}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                  >
                    {isSubmitting ? 'Saving...' : isEdit ? 'Update Booking' : 'Create Booking'}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </LocalizationProvider>
      </Paper>
    </Container>
  );
};

export default BookingForm; 