import React, { FC, useEffect, useState } from 'react';
import { Box, ListItem, Tooltip } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useActions } from '../../../redux/hooks/useActions';
import { ConfigType } from '../../../types/types';

interface CollapsePanelProps {
    isOpen: boolean;
    parentId: string;
    name: string;
}

const CollapsePanel: FC<CollapsePanelProps> = ({
    name,
    parentId,
    isOpen,
    children,
}) => {
    const { collapsiblePanelClick } = useActions();

    return (
        <>
            <ListItemButton
                sx={{ backgroundColor: '#d8e6f5' }}
                onClick={() => {
                    collapsiblePanelClick(
                        {
                            id: `${parentId}_${name}`,
                            name: name,
                            type: ConfigType.APPLICATION,
                        },
                        !isOpen
                    );
                }}
            >
                <div className="expand-icon">
                    {isOpen ? <ExpandLess /> : <ExpandMore />}
                </div>
                <ListItemText primary={name} sx={{ width: '100px' }} />
            </ListItemButton>
            <Collapse in={isOpen} sx={{ marginBottom: '2px' }}>
                <Box sx={{ padding: '5px 15px' }}>{children}</Box>
            </Collapse>
        </>
    );
};

export default CollapsePanel;
