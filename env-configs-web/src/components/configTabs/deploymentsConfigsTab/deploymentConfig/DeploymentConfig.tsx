import React, { FC, useEffect, useState } from 'react';
import { Box, Checkbox } from '@mui/material';
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
    const [defaultVal, setDefaultVal] = useState(config?.default);
    const [dev, setDev] = useState(config?.envOverride.dev);
    const [stage, setStage] = useState(config?.envOverride.stage);
    const [prod, setProd] = useState(config?.envOverride.prod);

    const [disabled, setDisabled] = useState(config?.isDisabled || false);
    const [checked, setChecked] = useState(!config?.isDisabled);

    useEffect(() => {
        setChecked(!config?.isDisabled);
    }, [config]);

    const editConfig = (disabled: boolean) => {
        onConfigEdit({
            ...config,
            isDisabled: disabled,
            default: defaultVal,
            envOverride: { dev, stage, prod },
        });
    };

    const getTextInput = (
        value = '',
        label: string,
        onChange: (e) => void,
        className?: string
    ) => {
        return (
            <TextField
                className={className || 'deploy-conf-value'}
                size="small"
                id="outlined-basic"
                disabled={disabled}
                value={value}
                label={label}
                onChange={(e) => onChange(e)}
                onBlur={() => editConfig(disabled)}
                variant="outlined"
            />
        );
    };

    return (
        <Box
            component="form"
            className={className}
            sx={{
                '& > :not(style)': { m: 1 },
            }}
            noValidate
            autoComplete="off"
        >
            <Checkbox
                size="small"
                checked={checked}
                onChange={(e) => {
                    setChecked(e.target.checked);
                    setDisabled(!e.target.checked);
                    editConfig(!e.target.checked);
                }}
            />
            {getTextInput(
                config?.type || '',
                'Type',
                (e) => {},
                'deploy-conf-type'
            )}
            {getTextInput(defaultVal, 'Default', (e) => {
                setDefaultVal(e.target.value);
            })}
            {getTextInput(dev, 'Dev', (e) => {
                setDev(e.target.value);
            })}
            {getTextInput(stage, 'Stage', (e) => {
                setStage(e.target.value);
            })}
            {getTextInput(prod, 'Prod', (e) => {
                setProd(e.target.value);
            })}
        </Box>
    );
};

export default DeploymentConfig;
