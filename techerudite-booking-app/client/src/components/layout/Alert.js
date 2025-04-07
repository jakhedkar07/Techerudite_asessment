import React from 'react';
import { useSelector } from 'react-redux';
import { Alert as MuiAlert, Snackbar } from '@mui/material';
import { removeAlert } from '../../redux/actions/alertActions';
import { useDispatch } from 'react-redux';

const Alert = () => {
  const alerts = useSelector(state => state.alert);
  const dispatch = useDispatch();

  const handleClose = (id) => {
    dispatch(removeAlert(id));
  };

  return (
    <>
      {alerts.map(alert => (
        <Snackbar
          key={alert.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          autoHideDuration={5000}
          onClose={() => handleClose(alert.id)}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            severity={alert.alertType}
            onClose={() => handleClose(alert.id)}
          >
            {alert.msg}
          </MuiAlert>
        </Snackbar>
      ))}
    </>
  );
};

export default Alert; 