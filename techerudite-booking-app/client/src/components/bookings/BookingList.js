import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  IconButton,
  Pagination,
  TablePagination,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { getBookings, deleteBooking } from '../../redux/actions/bookingActions';

const BookingList = () => {
  const dispatch = useDispatch();
  const { bookings, loading, pagination } = useSelector(state => state.booking);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load bookings on component mount and when page/rowsPerPage changes
  useEffect(() => {
    dispatch(getBookings(page, rowsPerPage));
  }, [dispatch, page, rowsPerPage]);

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  // Handle booking deletion
  const handleDelete = async (id) => {
    await dispatch(deleteBooking(id));
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            My Bookings
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/create-booking"
          >
            Create New Booking
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : bookings.length === 0 ? (
          <Box textAlign="center" my={4}>
            <Typography variant="h6">No bookings found</Typography>
            <Typography variant="body1" color="textSecondary" mt={1}>
              Create your first booking to get started
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map(booking => (
                    <TableRow key={booking._id} hover>
                      <TableCell>{booking.customerName}</TableCell>
                      <TableCell>{booking.customerEmail}</TableCell>
                      <TableCell>{format(new Date(booking.bookingDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Chip 
                          label={booking.bookingType} 
                          color={getStatusColor(booking.bookingType)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatBookingTime(booking)}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          component={Link} 
                          to={`/booking/${booking._id}`}
                          color="info"
                          size="small"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton 
                          component={Link} 
                          to={`/edit-booking/${booking._id}`}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handleDelete(booking._id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {pagination && (
              <Box display="flex" justifyContent="flex-end" mt={3}>
                <TablePagination
                  component="div"
                  count={pagination.total}
                  page={page - 1}
                  onPageChange={(e, newPage) => handlePageChange(e, newPage + 1)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default BookingList; 