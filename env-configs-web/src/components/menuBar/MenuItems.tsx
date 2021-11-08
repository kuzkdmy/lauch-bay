import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import { styled } from '@mui/material/styles';
import { ConfigType } from '../../types/types';

interface MenuItemsProps {
    name: string;
    type: ConfigType;
    rows: any[];
    nestedItems: any[];
    topLevelItem: any;
    addItem: (
        name: string,
        type: ConfigType,
        rows: any[],
        topLevelItem: any
    ) => void;
    topLevel: boolean;
    isOpened: boolean;
    pl: number;
}

const MenuItems: FC<MenuItemsProps> = ({
    name,
    nestedItems,
    pl,
    rows,
    type,
    addItem,
    topLevelItem,
    topLevel,
    isOpened,
}) => {
    const [open, setOpen] = useState(isOpened);

    useEffect(() => setOpen(isOpened), [isOpened]);

    const handleClick = () => {
        setOpen(!open);
        if (!topLevel) {
            addItem(name, type, rows, topLevelItem);
        }
    };

    const StyledListItemButton = styled(ListItemButton)(() => ({
        '&': {
            backgroundColor: '#fafafa',
        },
    }));

    const getCollapse = (item: any) => {
        return (
            <Collapse in={open} timeout="auto" unmountOnExit>
                <MenuItems
                    {...{ ...item, topLevel: false, pl: item.pl + 2, addItem }}
                />
            </Collapse>
        );
    };

    return (
        <>
            <StyledListItemButton onClick={handleClick} sx={{ pl }}>
                <ListItemText primary={name} />
                {nestedItems && (open ? <ExpandLess /> : <ExpandMore />)}
            </StyledListItemButton>
            {nestedItems?.map((nested) =>
                getCollapse({
                    ...nested,
                    topLevel: false,
                    pl,
                    topLevelItem: { name, type, rows },
                })
            )}
        </>
    );
};

export default connect(null, null)(MenuItems);
