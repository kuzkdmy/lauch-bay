import React, { FC } from 'react';
import { Backdrop, Box, CircularProgress, Skeleton } from '@mui/material';

interface LoaderProps {
    isLoading: boolean;
}

const Loader: FC<LoaderProps> = ({ isLoading }) => {
    return (
        <Box sx={{ margin: '10px 40px' }}>
            <Skeleton
                height="20px"
                width="250px"
                variant="text"
                hidden={!isLoading}
            />
            <Skeleton
                height="20px"
                width="250px"
                variant="text"
                hidden={!isLoading}
            />
            <Skeleton
                height="20px"
                width="250px"
                variant="text"
                hidden={!isLoading}
            />
        </Box>
    );
};

export default Loader;
