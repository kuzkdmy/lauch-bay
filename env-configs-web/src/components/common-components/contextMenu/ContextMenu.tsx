import React, { FC } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box } from '@mui/material';

interface ContextMenuProps {
    options: any[];
    sx: any;
}

const ContextMenu: FC<ContextMenuProps> = ({ options, sx }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box sx={sx}>
            <MoreVertIcon
                onClick={(e) => {
                    e.stopPropagation();
                    handleClick(e);
                }}
            />
            <Menu
                id="long-menu"
                MenuListProps={{
                    'aria-labelledby': 'long-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        width: '15ch',
                    },
                }}
            >
                {options.map((option) => (
                    <MenuItem
                        key={option}
                        sx={{ height: '20px' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClose();
                        }}
                    >
                        {option}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

export default ContextMenu;
