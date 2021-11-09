import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import { styled } from '@mui/material/styles';
import { Configs, ConfigType } from '../../types/types';
import { useActions } from '../../redux/hooks/useActions';
import { fetchApplicationConfigs } from '../../redux/actions/configsActions';
import { Alert, ListItem, Tooltip } from '@mui/material';
import { collapsiblePanelClick } from '../../redux/actions/menuActions';
import { useTypedSelector } from '../../redux/hooks/useTypedSelector';
import EditIcon from '@mui/icons-material/Edit';

interface MenuItemsProps {
    item: Configs;
    projectId: string;
    pl: number;
    isTopLevel?: boolean;
    additionalClass?: string;
    nestedItems?: any[];
    index: number;
}

const ProjectItems: FC<MenuItemsProps> = ({
    item,
    pl,
    additionalClass,
    nestedItems = [],
    index,
}) => {
    const { fetchApplicationConfigs, collapsiblePanelClick, openMenu } =
        useActions();

    const { collapsedItems } = useTypedSelector((state) => state.menu);

    const [isOpened, setIsOpened] = useState(false);

    useEffect(
        () => setIsOpened(collapsedItems[item.name]),
        [collapsedItems, item]
    );

    const handleClick = () => {
        collapsiblePanelClick({
            item: {
                name: item.name,
                type: ConfigType.MICROSERVICE,
            },
            isOpened: !isOpened,
        });
        setIsOpened(!isOpened);
        fetchApplicationConfigs(item.id!);
    };

    const StyledListItemButton = styled(ListItemButton)(() => ({
        backgroundColor: index % 2 ? '#f5f8ff' : '#e5edf8',
    }));

    const getCollapsedItems = (index: number, nested: any) => {
        return (
            <Collapse in={isOpened} timeout="auto" unmountOnExit key={index}>
                <ListItem
                    key={index}
                    onClick={() => {
                        if (nested) {
                            openMenu({
                                id: nested.id,
                                name: nested.name,
                                type: ConfigType.MICROSERVICE,
                                hasGlobalConfigType: true,
                                hasProjectConfigType: true,
                                isTableContent: true,
                            });
                        }
                    }}
                    sx={{
                        pl: 6,
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: nested ? '#f1f1f1' : '' },
                    }}
                >
                    {nested ? (
                        <ListItemText primary={nested.name} />
                    ) : (
                        <Alert severity="warning" sx={{ width: '90%' }}>
                            There are no applications
                        </Alert>
                    )}
                </ListItem>
            </Collapse>
        );
    };

    return (
        <>
            <StyledListItemButton
                onClick={handleClick}
                sx={{ pl: pl }}
                className={additionalClass}
            >
                {isOpened ? <ExpandLess /> : <ExpandMore />}
                <ListItemText primary={item.name} />
                <Tooltip
                    placement={'top-start'}
                    title="Edit"
                    onClick={(e) => {
                        e.stopPropagation();
                        openMenu({
                            id: item.id,
                            name: item.name,
                            isTableContent: true,
                            hasGlobalConfigType: true,
                            type: ConfigType.PROJECT,
                        });
                    }}
                >
                    <EditIcon color="primary" />
                </Tooltip>
            </StyledListItemButton>
            {nestedItems?.length > 0
                ? nestedItems.map((nested: any, index: number) =>
                      getCollapsedItems(index, nested)
                  )
                : getCollapsedItems(0, null)}
        </>
    );
};

export default ProjectItems;
