import { styled } from '@mui/material/styles';
import { ListItemButton } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import React, { FC } from 'react';

interface ListItemButtonProps {
    onClick: () => void;
    name: string;
    index: number;
    disabled?: boolean;
}

const StyledListItemButton: FC<ListItemButtonProps> = ({
    onClick,
    name,
    index,
    disabled,
}) => {
    const StyledListItemButton = styled(ListItemButton)(() => ({
        backgroundColor: index % 2 ? '#f5f8ff' : '#e5edf8',
        '&:onclick': { backgroundColor: 'red' },
    }));

    return (
        <StyledListItemButton onClick={onClick} disabled={disabled}>
            <ListItemText primary={name} />
        </StyledListItemButton>
    );
};

export default StyledListItemButton;
