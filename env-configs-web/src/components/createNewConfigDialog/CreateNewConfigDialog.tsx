import React, { FC, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Box } from '@mui/material';
import { useActions } from '../../redux/hooks/useActions';
import { ConfigType } from '../../types/types';
import { createConfigs } from '../../redux/actions/configsActions';
import { getEmptyConfigRow } from '../configTabs/utils/configTabsUtils';

interface DialogProps {
    configType: { type: ConfigType; projectId: string };
    isOpened: boolean;
    onClose: () => void;
}

const CreateNewDialog: FC<DialogProps> = ({
    isOpened,
    onClose,
    configType,
}) => {
    const [id, setId] = useState('');
    const [projectName, setProjectName] = useState('');
    const [isValid, setIsValid] = useState(true);

    const { createConfigs, fetchConfigs } = useActions();

    const onCreate = () => {
        const areFieldsNotEmpty = id.length > 0 && projectName.length > 0;
        setIsValid(areFieldsNotEmpty);
        if (areFieldsNotEmpty) {
            createConfigs({
                ...getEmptyConfigRow(),
                name: projectName,
                projectId: configType.projectId,
                id,
                confType: configType.type,
            });
            onCancel();
        }
    };

    const onCancel = () => {
        setId('');
        setProjectName('');
        setIsValid(true);
        onClose();
    };

    return (
        <div>
            <Dialog open={isOpened} onClose={onClose}>
                <DialogTitle>Create New Config</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter Config id and name
                    </DialogContentText>
                    <Box
                        component="form"
                        sx={{
                            '& .MuiTextField-root': { m: 1, width: '25ch' },
                        }}
                        noValidate
                        autoComplete="off"
                    >
                        <TextField
                            required
                            onChange={(e) => setId(e.target.value)}
                            error={!isValid}
                            label={
                                configType?.type === ConfigType.PROJECT
                                    ? 'project id'
                                    : 'application id'
                            }
                            id="project_id"
                        />
                        <TextField
                            required
                            onChange={(e) => setProjectName(e.target.value)}
                            error={!isValid}
                            label={
                                configType?.type === ConfigType.PROJECT
                                    ? 'project name'
                                    : 'application name'
                            }
                            id="project_name"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            onCreate();
                        }}
                        variant="contained"
                    >
                        Create
                    </Button>
                    <Button onClick={onCancel} variant="outlined">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CreateNewDialog;
