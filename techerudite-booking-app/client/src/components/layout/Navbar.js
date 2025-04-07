import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { logout } from '../../redux/actions/authActions';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const authLinks = (
    <>
      <Button color="inherit" component={Link} to="/bookings">
        My Bookings
      </Button>
      <Button color="inherit" component={Link} to="/create-booking">
        Create Booking
      </Button>
      <Box sx={{ flexGrow: 1 }} />
      <Typography variant="subtitle2" sx={{ mr: 2 }}>
        Hello, {user?.firstName}
      </Typography>
      <Button color="inherit" onClick={handleLogout}>
        Logout
      </Button>
    </>
  );

  const guestLinks = (
    <>
      <Box sx={{ flexGrow: 1 }} />
      <Button color="inherit" component={Link} to="/login">
        Login
      </Button>
      <Button color="inherit" component={Link} to="/register">
        Register
      </Button>
    </>
  );

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: 'none', color: 'white', flexGrow: 1 }}>
            Techerudite Booking
          </Typography>
          {isAuthenticated ? authLinks : guestLinks}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 