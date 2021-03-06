import * as React from 'react';
import { FC } from 'react';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import { styled } from '@mui/material/styles';
import { Configs, ConfigType } from '../../../types/types';
import { useActions } from '../../../redux/hooks/useActions';
import { Alert, ListItem, Tooltip } from '@mui/material';
import { collapsiblePanelClick } from '../../../redux/actions/tabActions';
import { useTypedSelector } from '../../../redux/hooks/useTypedSelector';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

interface ConfigListItemsProps {
    project: Configs;
    pl: number;
    isTopLevel?: boolean;
    additionalClass?: string;
    isOpen: boolean;
    index: number;
    showCreateNewDialog: () => void;
}

const ConfigListItems: FC<ConfigListItemsProps> = ({
    project,
    pl,
    additionalClass,
    isOpen,
    index,
    showCreateNewDialog,
}) => {
    const { collapsiblePanelClick, fetchConfigs } = useActions();
    const { configs } = useTypedSelector((state) => state.configsState);

    const handleClick = () => {
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
                                pl: 8,
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
                sx={{ pl }}
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
            {getCollapsedItems(
                Object.keys(configs[ConfigType.APPLICATION])
                    .map((key) => configs[ConfigType.APPLICATION][key])
                    .filter((conf) => conf.projectId === project.id)
            )}
        </>
    );
};

export default ConfigListItems;
