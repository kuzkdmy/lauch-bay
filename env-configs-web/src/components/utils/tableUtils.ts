import { Config } from '../../types/types';
import { isBoolean } from 'lodash';

const getDefaultValue = () => ({
    integer: () => 0,
    string: () => '',
    boolean: () => false,
});

const getValue = (value: any) => {
    if (isBoolean(value)) {
        return { value };
    }
    return value ? { value } : null;
};

export const updateEnvConfColValue = (
    value: any,
    configRow: Config,
    colId: string
): Config => {
    switch (colId) {
        case 'dev':
            return {
                ...configRow,
                envOverride: {
                    ...configRow.envOverride,
                    dev: getValue(value),
                },
            };
        case 'stage':
            return {
                ...configRow,
                envOverride: {
                    ...configRow.envOverride,
                    stage: getValue(value),
                },
            };
        case 'prod':
            return {
                ...configRow,
                envOverride: {
                    ...configRow.envOverride,
                    prod: getValue(value),
                },
            };
        case 'default':
            return {
                ...configRow,
                [colId]: getValue(value),
            };
        case 'type':
            return {
                ...configRow,
                default: { value: getDefaultValue()[value]() },
                envOverride: { dev: null, prod: null, stage: null },
                [colId]: value,
            };
        default:
            return { ...configRow, [colId]: value };
    }
};

export const updateDeploymentConfColValue = (
    value: any,
    configRow: Config,
    colId: string
): Config => {
    switch (colId) {
        case 'dev':
            return {
                ...configRow,
                envOverride: {
                    ...configRow.envOverride,
                    dev: value,
                },
            };
        case 'stage':
            return {
                ...configRow,
                envOverride: {
                    ...configRow.envOverride,
                    stage: value,
                },
            };
        case 'prod':
            return {
                ...configRow,
                envOverride: {
                    ...configRow.envOverride,
                    prod: value,
                },
            };
        case 'default':
            return {
                ...configRow,
                [colId]: value,
            };
        default:
            return configRow;
    }
};
