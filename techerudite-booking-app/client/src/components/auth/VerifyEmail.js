import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { verifyEmail } from '../../redux/actions/authActions';
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Box
} from '@mui/material';

const VerifyEmail = () => {
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      // Get token from URL query parameter
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get('token');

      if (!token) {
        setVerifying(false);
        return;
      }

      try {
        const success = await dispatch(verifyEmail(token));
        setVerified(success);
      } catch (error) {
        console.error('Verification error:', error);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [dispatch, location.search]);

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Email Verification
        </Typography>

        {verifying ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : verified ? (
          <>
            <Typography variant="h6" color="primary" gutterBottom>
              Your email has been verified successfully!
            </Typography>
            <Typography variant="body1" paragraph>
              You can now log in to your account.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              Go to Login
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h6" color="error" gutterBottom>
              Verification Failed
            </Typography>
            <Typography variant="body1" paragraph>
              The verification link is invalid or has expired.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              Back to Login
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default VerifyEmail; 