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
import { Alert, ListItem, Tooltip } from '@mui/material';
import { collapsiblePanelClick } from '../../redux/actions/menuActions';
import { useTypedSelector } from '../../redux/hooks/useTypedSelector';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import _ from 'lodash';

interface MenuItemsProps {
    project: Configs;
    pl: number;
    isTopLevel?: boolean;
    additionalClass?: string;
    index: number;
    showCreateNewDialog: () => void;
}

const ProjectItems: FC<MenuItemsProps> = ({
    project,
    pl,
    additionalClass,
    index,
    showCreateNewDialog,
}) => {
    const { collapsiblePanelClick, fetchConfigs, openMenu } = useActions();

    const { configs } = useTypedSelector((state) => state.configsState);
    const { collapsiblePanelState } = useTypedSelector((state) => state.menu);
    const [isOpen, setIsOpen] = useState(false);
    // const [applications, setApplications] = useMemo(() => {}, [project]);

    useEffect(() => {
        console.log(collapsiblePanelState[project.id]);
        setIsOpen(collapsiblePanelState[project.id]);
    }, [collapsiblePanelState, project]);

    const handleClick = () => {
        setIsOpen(!isOpen);
        collapsiblePanelClick(
            {
                name: project.name,
                id: project.id,
                type: ConfigType.PROJECT,
            },
            !isOpen
        );
        !isOpen &&
            fetchConfigs({
                type: ConfigType.APPLICATION,
                id: project.id,
                projectId: project.id,
                name: project.name,
            });
    };

    const StyledListItemButton = styled(ListItemButton)(() => ({
        backgroundColor: index % 2 ? '#f5f8ff' : '#e5edf8',
        '&:onclick': { backgroundColor: 'red' },
    }));

    const getCollapsedItems = (app: any[]) => {
        return app.length > 0 ? (
            app.map((app, index) => {
                return (
                    <Collapse
                        in={isOpen}
                        timeout="auto"
                        unmountOnExit
                        key={index}
                    >
                        <ListItem
                            key={index}
                            onClick={() => {
                                if (app) {
                                    fetchConfigs({
                                        type: ConfigType.APPLICATION,
                                        id: app.id,
                                        name: app.name,
                                        isTableContent: true,
                                        openAfterFetching: true,
                                    });
                                }
                            }}
                            sx={{
                                pl: 6,
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: app ? '#f1f1f1' : '',
                                },
                            }}
                        >
                            <ListItemText primary={app.name} />
                        </ListItem>
                    </Collapse>
                );
            })
        ) : (
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <Alert severity="warning">There are no applications</Alert>
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
                <div className="expand-icon">
                    {isOpen ? <ExpandLess /> : <ExpandMore />}
                </div>
                <ListItemText primary={project.name} sx={{ width: '100px' }} />
                <div>
                    <Tooltip
                        placement={'top-start'}
                        title="Add New Application"
                        sx={{ marginRight: '25px' }}
                    >
                        <AddIcon
                            color="primary"
                            sx={{ marginRight: '10px' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                showCreateNewDialog();
                            }}
                        />
                    </Tooltip>
                    <Tooltip
                        placement={'top-start'}
                        title="Edit"
                        onClick={(e) => {
                            e.stopPropagation();
                            fetchConfigs({
                                type: ConfigType.PROJECT,
                                id: project.id,
                                name: project.name,
                                isTableContent: true,
                                openAfterFetching: true,
                            });
                        }}
                    >
                        <EditIcon color="primary" />
                    </Tooltip>
                </div>
            </StyledListItemButton>
            {Array.isArray(configs[project.id])
                ? getCollapsedItems(configs[project.id])
                : null}
        </>
    );
};

export default ProjectItems;
