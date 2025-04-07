import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { login, resendVerification } from '../../redux/actions/authActions';

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
});

const ResendSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required')
});

const Login = () => {
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Initial form values
  const initialValues = {
    email: '',
    password: ''
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(login(values.email, values.password));
      navigate('/bookings');
    } catch (err) {
      if (err.message && err.message.includes('verify your email')) {
        setEmailForVerification(values.email);
        setVerificationDialog(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle resend verification
  const handleResendVerification = async () => {
    await dispatch(resendVerification(emailForVerification));
    setVerificationDialog(false);
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Login
        </Typography>
        
        <Formik
          initialValues={initialValues}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="email"
                    label="Email"
                    fullWidth
                    variant="outlined"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="password"
                    label="Password"
                    type="password"
                    fullWidth
                    variant="outlined"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                  />
                </Grid>
              </Grid>
              
              <Box mt={3}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
              </Box>
              
              <Box mt={2} textAlign="center">
                <Typography variant="body2">
                  Don't have an account?{' '}
                  <Link to="/register">Register</Link>
                </Typography>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
      
      {/* Verification Dialog */}
      <Dialog open={verificationDialog} onClose={() => setVerificationDialog(false)}>
        <DialogTitle>Email Verification Required</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Your email address has not been verified yet. Would you like to resend the verification email?
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {emailForVerification}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleResendVerification} 
            variant="contained" 
            color="primary"
          >
            Resend Verification
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login; 