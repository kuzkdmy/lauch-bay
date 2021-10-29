import * as React from "react";
import {FC, useEffect, useState} from "react";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import {addItem} from "../../redux/actions";
import {connect} from "react-redux";
import {styled} from "@mui/material/styles";

interface SideBarItemProps {
    name: string;
    nestedItems: any[];
    addItem: (name: string) => void;
    topLevel: boolean;
    isOpened: boolean;
    pl: number;
}

const SideBarItem: FC<SideBarItemProps> = ({
        name,
        nestedItems,
        pl,
        addItem,
        topLevel,
        isOpened
    }) => {
    const [open, setOpen] = useState(isOpened);

    useEffect(() => setOpen(isOpened), [isOpened])

    const handleClick = () => {
        setOpen(!open);
        if (!topLevel) {
            addItem(name);
        }
    };

    const StyledListItemButton = styled(ListItemButton)(({theme}) => ({
        '&': {
            backgroundColor: '#fafafa',
        }
    }));


    const getCollapse = (item: any) => {
        return (
            <Collapse in={open} timeout="auto" unmountOnExit>
                <SideBarItem {...{...item, topLevel: false, pl: item.pl + 2, addItem}}/>
            </Collapse>
        );
    }

    return (
        <>
            <StyledListItemButton onClick={handleClick} sx={{pl}}>
                <ListItemText primary={name}/>
                {nestedItems && (open ? <ExpandLess/> : <ExpandMore/>)}
            </StyledListItemButton>
            {nestedItems?.map(nested => getCollapse({...nested, topLevel: false, pl}))}
        </>
    );
}

export default connect(null, {addItem})(SideBarItem);