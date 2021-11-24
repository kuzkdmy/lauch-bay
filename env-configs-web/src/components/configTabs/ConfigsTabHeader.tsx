import React, { FC, useEffect, useState } from 'react';
import {
    Button,
    Checkbox,
    FormControlLabel,
    FormGroup,
    IconButton,
    Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/HighlightOff';
import AddIcon from '@mui/icons-material/Add';
import { ConfigType, TabItemType } from '../../types/types';
import { getEmptyConfigRow } from '../utils/configTabsUtils';
import { useActions } from '../../redux/hooks/useActions';
import { useTypedSelector } from '../../redux/hooks/useTypedSelector';
import _ from 'lodash';
import DeleteIcon from '@mui/icons-material/DeleteForever';

interface ConfigsSubHeaderProps {
    isEdit: boolean;
    setIsEdit?: any;
    onAddNewRow?: any;
    onSave: any;
    tabItem: TabItemType;
    showInherited?: boolean;
    setShowInherited?: any;
}

const ConfigsTabHeader: FC<ConfigsSubHeaderProps> = ({
    isEdit,
    setIsEdit,
    tabItem,
    onSave,
    onAddNewRow,
    showInherited,
    setShowInherited,
}: any) => {
    const { editConfigItem } = useActions();
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
                    disabled={!isEdit}
                    onClick={onSave}
                    sx={{ marginRight: 1, height: 30, width: 120 }}
                >
                    Save
                </Button>
                <>
                    {isEdit ? (
                        <>
                            <IconButton
                                sx={{ marginRight: '10px' }}
                                onClick={onAddNewRow}
                            >
                                <Tooltip
                                    disableFocusListener={true}
                                    placement={'top-start'}
                                    title="Add New Row"
                                >
                                    <AddIcon />
                                </Tooltip>
                            </IconButton>
                            <Tooltip
                                disableFocusListener={true}
                                placement={'top-start'}
                                title="Delete Config"
                            >
                                <IconButton>
                                    <DeleteIcon
                                        color="warning"
                                        sx={{ fontSize: 31 }}
                                    />
                                </IconButton>
                            </Tooltip>
                            <Tooltip
                                disableFocusListener={true}
                                placement={'top-start'}
                                title="Cancel"
                            >
                                <IconButton
                                    sx={{ marginRight: 5 }}
                                    onClick={() => {
                                        editConfigItem(
                                            {
                                                ...getEmptyConfigRow(),
                                                id: tabItem.id,
                                                confType: tabItem.type,
                                            },
                                            !isEdit
                                        );
                                        setIsEdit(false);
                                    }}
                                >
                                    <CancelIcon color="info" />
                                </IconButton>
                            </Tooltip>
                        </>
                    ) : (
                        <Tooltip
                            disableFocusListener={true}
                            placement={'top-start'}
                            title="Edit"
                        >
                            <IconButton
                                sx={{ marginRight: '10px' }}
                                onClick={() => {
                                    const configToEdit =
                                        configs[tabItem.type][tabItem.id];
                                    if (!_.isEmpty(configToEdit)) {
                                        editConfigItem(
                                            {
                                                ...configToEdit,
                                                id: tabItem.id,
                                                confType: tabItem.type,
                                            },
                                            true
                                        );
                                    }
                                    setIsEdit(true);
                                }}
                            >
                                <EditIcon color="primary" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {tabItem?.type !== ConfigType.GLOBAL && (
                        <FormControlLabel
                            className="check-box"
                            onChange={() => {
                                setShowInherited(!showInherited);
                            }}
                            control={<Checkbox />}
                            label="Show Inherited Configs"
                        />
                    )}
                </>
            </FormGroup>
        </>
    );
};

export default ConfigsTabHeader;
