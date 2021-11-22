import React, { FC, useEffect, useState } from 'react';
import { Box, Checkbox, Switch } from '@mui/material';
import { TextField } from '@material-ui/core';
import { Config } from '../../../../types/types';
import _ from 'lodash';

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

    const renderValue = (
        value,
        label: string,
        onChange: (e) => void,
        className?: string
    ) => {
        return _.isBoolean(config.default) ? (
            <Switch
                sx={{ '&.MuiSwitch-root': { marginLeft: '40px' } }}
                size="small"
                value={value}
                disabled={disabled}
                checked={value}
                onChange={(e) => {
                    onChange(e.target.checked);
                    editConfig(disabled);
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
                disabled={disabled}
                value={value}
                label={label}
                onChange={(e) => onChange(e.target.value)}
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
                checked={checked}
                onChange={(e) => {
                    setChecked(e.target.checked);
                    setDisabled(!e.target.checked);
                    editConfig(!e.target.checked);
                }}
            />
            {getTextInputField(
                config?.type || '',
                'Type',
                () => {},
                'deploy-conf-type'
            )}
            {renderValue(defaultVal, 'Default', (val) => {
                setDefaultVal(val);
            })}
            {renderValue(dev, 'Dev', (val) => {
                setDev(val);
            })}
            {renderValue(stage, 'Stage', (val) => {
                setStage(val);
            })}
            {renderValue(prod, 'Prod', (val) => {
                setProd(val);
            })}
        </Box>
    );
};

export default DeploymentConfig;
