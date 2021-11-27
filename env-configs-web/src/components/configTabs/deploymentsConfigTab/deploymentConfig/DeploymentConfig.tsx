import React, { FC, useEffect, useState } from 'react';
import { Box, Checkbox, Switch } from '@mui/material';
import { TextField } from '@material-ui/core';
import { Config } from '../../../../types/types';

interface DeploymentConfigProps {
    className: string;
    config: Config;
    onConfigEdit: (config) => void;
}

const DeploymentConfig: FC<DeploymentConfigProps> = ({
    className,
    config,
    onConfigEdit,
}) => {
    const [confDeployment, setConfDeployment] = useState(config);

    const editConfig = (disabled: boolean) => {
        onConfigEdit({
            ...confDeployment,
            isDisabled: disabled,
        });
    };

    const renderValue = (
        value,
        label: string,
        onChange: (e) => void,
        className?: string
    ) => {
        return config?.type === 'empty_dir_memory' ? (
            <Switch
                sx={{ '&.MuiSwitch-root': { marginLeft: '40px' } }}
                size="small"
                value={value}
                disabled={config?.isDisabled}
                checked={value}
                onBlur={() => editConfig(config?.isDisabled!)}
                onChange={(e) => {
                    onChange(e.target.checked);
                }}
            />
        ) : (
            getTextInputField(value, label, onChange, className)
        );
    };

    const getTextInputField = (
        value: any,
        label: string,
        onChange: any,
        className?: string
    ) => {
        return (
            <TextField
                className={className || 'deploy-conf-value'}
                size="small"
                id="outlined-basic"
                disabled={config?.isDisabled}
                value={value}
                label={label}
                onChange={(e) => onChange(e.target.value)}
                onBlur={() => editConfig(config?.isDisabled!)}
                variant="outlined"
            />
        );
    };

    return (
        <Box
            component="form"
            className={className}
            sx={{
                display: 'flex',
                flexWrap: 'nowrap',
                alignItems: 'center',
                '& > :not(style)': { m: 1 },
            }}
            noValidate
            autoComplete="off"
        >
            <Checkbox
                size="small"
                checked={!config?.isDisabled}
                onChange={(e) => {
                    editConfig(!e.target.checked);
                }}
            />
            {getTextInputField(
                config?.type || '',
                'Type',
                () => {},
                'deploy-conf-type'
            )}
            {renderValue(confDeployment?.default, 'Default', (val) => {
                setConfDeployment({ ...confDeployment, default: val });
            })}
            {renderValue(confDeployment?.envOverride.dev, 'Dev', (val) => {
                setConfDeployment({
                    ...confDeployment,
                    envOverride: { ...confDeployment.envOverride, dev: val },
                });
            })}
            {renderValue(confDeployment?.envOverride.stage, 'Stage', (val) => {
                setConfDeployment({
                    ...confDeployment,
                    envOverride: { ...confDeployment.envOverride, stage: val },
                });
            })}
            {renderValue(confDeployment?.envOverride.prod, 'Prod', (val) => {
                setConfDeployment({
                    ...confDeployment,
                    envOverride: { ...confDeployment.envOverride, prod: val },
                });
            })}
        </Box>
    );
};

export default DeploymentConfig;
