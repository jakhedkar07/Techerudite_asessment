import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Event as EventIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { getBookingById, deleteBooking, clearBooking } from '../../redux/actions/bookingActions';

const BookingDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { booking, loading } = useSelector(state => state.booking);

  useEffect(() => {
    dispatch(getBookingById(id));

    // Clear booking data when component unmounts
    return () => {
      dispatch(clearBooking());
    };
  }, [dispatch, id]);

  const handleDelete = async () => {
    const deleted = await dispatch(deleteBooking(id));
    if (deleted) {
      navigate('/bookings');
    }
  };

  // Helper function to format booking time
  const formatBookingTime = (booking) => {
    if (booking.bookingType === 'Full Day') {
      return 'Full Day';
    } else if (booking.bookingType === 'Half Day') {
      return `Half Day (${booking.bookingSlot})`;
    } else {
      return `${format(new Date(booking.bookingTimeFrom), 'h:mm a')} - ${format(new Date(booking.bookingTimeTo), 'h:mm a')}`;
    }
  };

  // Helper function to get status chip color
  const getStatusColor = (bookingType) => {
    switch (bookingType) {
      case 'Full Day':
        return 'primary';
      case 'Half Day':
        return 'secondary';
      case 'Custom':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading || !booking) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Typography variant="h4" component="h1">
            Booking Details
          </Typography>
          <Chip 
            label={booking.bookingType} 
            color={getStatusColor(booking.bookingType)} 
            size="medium" 
          />
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <PersonIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Customer Name
                </Typography>
                <Typography variant="body1">
                  {booking.customerName}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <EmailIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Customer Email
                </Typography>
                <Typography variant="body1">
                  {booking.customerEmail}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <EventIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Booking Date
                </Typography>
                <Typography variant="body1">
                  {format(new Date(booking.bookingDate), 'MMMM dd, yyyy')}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <TimeIcon color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Booking Time
                </Typography>
                <Typography variant="body1">
                  {formatBookingTime(booking)}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box display="flex" justifyContent="space-between">
          <Button
            variant="outlined"
            component={Link}
            to="/bookings"
          >
            Back to Bookings
          </Button>
          <Box>
            <Button
              variant="outlined"
              color="primary"
              component={Link}
              to={`/edit-booking/${id}`}
              sx={{ mr: 2 }}
            >
              Edit Booking
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
            >
              Delete Booking
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default BookingDetails; 