import React, { FC, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import { Alert, IconButton } from '@mui/material';
import { useTypedSelector } from '../../redux/hooks/useTypedSelector';
import { useActions } from '../../redux/hooks/useActions';
import { Button } from '@material-ui/core';
import { AlertColor } from '@mui/material/Alert/Alert';

export interface NotificationProps {
    message: string;
    alertSeverity: AlertColor;
    visibilityState: { setVisible: any; isVisible: any };
}

const NotificationComponent: FC<NotificationProps> = ({
    message,
    alertSeverity,
    visibilityState,
}) => {
    const [open, setOpen] = React.useState(false);

    const onClose = () => {
        setOpen(false);
        visibilityState.setVisible(false);
    };

    useEffect(
        () => setOpen(visibilityState.isVisible),
        [visibilityState.isVisible]
    );

    return (
        <Snackbar
            open={open}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            message={message}
            onClose={onClose}
        >
            <Alert severity={alertSeverity} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
};

export default NotificationComponent;
