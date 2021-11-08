import {styled} from "@mui/material/styles";
import {ListItemButton} from "@mui/material";
import ListItemText from "@mui/material/ListItemText";
import React, {FC} from "react";

interface ListItemButtonProps {
    onClick: () => void;
    name: string;
    disabled?: boolean;
}

const StyledListItemButton:FC<ListItemButtonProps> = ({onClick, name, disabled}) => {

    const StyledListItemButton = styled(ListItemButton)(({theme}) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: '#eef4fb'
        },
        '&:hover': {
            backgroundColor: '#b5d2f3'
        }
    }));

    return (
        <StyledListItemButton onClick={onClick} disabled={disabled}>
            <ListItemText primary={name}/>
        </StyledListItemButton>
    )
}

export default StyledListItemButton;