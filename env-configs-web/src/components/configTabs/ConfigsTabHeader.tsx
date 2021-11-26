import React, { FC } from 'react';
import { Button, Divider, FormGroup, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { TabItemType } from '../../types/types';
import { getEmptyConfigRow } from '../utils/configTabsUtils';
import { useActions } from '../../redux/hooks/useActions';
import { useTypedSelector } from '../../redux/hooks/useTypedSelector';

interface ConfigsSubHeaderProps {
    onSave: any;
    tabItem: TabItemType;
    showInherited?: boolean;
    setShowInherited?: any;
}

const ConfigsTabHeader: FC<ConfigsSubHeaderProps> = ({
    tabItem,
    onSave,
}: any) => {
    const { editConfigItem, addNewRowToConfig } = useActions();
    const { editTabs, activeTabId } = useTypedSelector(
        (state) => state.tabState
    );
    const { configs } = useTypedSelector((state) => state.configsState);

    return (
        <>
            <FormGroup
                sx={{
                    display: 'flex',
                    width: '500px',
                    flexDirection: 'row',
                    alignItems: 'center',
                    margin: '5px 25px 20px',
                }}
            >
                <Button
                    variant="outlined"
                    disabled={!editTabs[activeTabId]}
                    onClick={onSave}
                    sx={{ marginRight: 1, height: 25, width: 80 }}
                >
                    Save
                </Button>
                <Button
                    variant="outlined"
                    disabled={!editTabs[activeTabId]}
                    onClick={() => {
                        editConfigItem(
                            {
                                ...getEmptyConfigRow(),
                                id: activeTabId,
                                confType: tabItem.type,
                            },
                            false
                        );
                    }}
                    sx={{ marginRight: 1, height: 25, width: 80 }}
                >
                    Cancel
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    sx={{ marginRight: 1, height: 25, width: 160 }}
                >
                    Delete Config
                </Button>
                <IconButton
                    sx={{ marginRight: '10px' }}
                    onClick={() => {
                        if (!editTabs[activeTabId]) {
                            editConfigItem(
                                configs[tabItem.type][tabItem.id],
                                true
                            );
                        }
                        addNewRowToConfig(activeTabId);
                    }}
                >
                    <Tooltip
                        disableFocusListener={true}
                        placement={'top-start'}
                        title="Add New Row"
                    >
                        <AddIcon />
                    </Tooltip>
                </IconButton>
            </FormGroup>
            <Divider />
        </>
    );
};

export default ConfigsTabHeader;
