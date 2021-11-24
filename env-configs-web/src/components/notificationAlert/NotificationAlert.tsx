import React, { FC, useEffect, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import { Alert, IconButton } from '@mui/material';
import { useTypedSelector } from '../../redux/hooks/useTypedSelector';
import { useActions } from '../../redux/hooks/useActions';
import { Button } from '@material-ui/core';
import { AlertColor } from '@mui/material/Alert/Alert';

const NotificationAlert = () => {
    const [open, setOpen] = React.useState(false);
    const { hasErrors, successfullyUpdated, successfullyCreated } =
        useTypedSelector((state) => state.configsState);
    const { setHasErrors } = useActions();

    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('success' as AlertColor);

    const onClose = () => {
        setOpen(false);
        setHasErrors(false);
    };

    useEffect(() => {
        setMessage('Something went wrong !');
        setSeverity('error');
        setOpen(hasErrors);
    }, [hasErrors]);

    useEffect(() => {
        setMessage('Successfully created');
        setSeverity('success');
        setOpen(successfullyCreated);
    }, [successfullyCreated]);

    useEffect(() => {
        setMessage('Successfully updated');
        setSeverity('success');
        setOpen(successfullyUpdated);
    }, [successfullyUpdated]);

    return (
        <Snackbar
            open={open}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            message={message}
            onClose={onClose}
        >
            <Alert severity={severity} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
};

export default NotificationAlert;
