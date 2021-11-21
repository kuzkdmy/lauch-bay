import { Config } from '../../types/types';

export const getEnvConfigColumns = (): any[] => [
    {
        id: 'envKey',
        getLabel: (row?: Config) => 'Name',
        minWidth: 600,
        align: 'left',
        paddingLeft: 0,
        getValue: (row: any) => row.envKey || '',
    },
    {
        id: 'type',
        getLabel: (row?: Config) => 'Type',
        minWidth: 80,
        align: 'center',
        getValue: (row: Config) => row.type || '',
    },
    {
        id: 'default',
        getLabel: (row?: Config) => 'Default',
        minWidth: 150,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.default?.value,
    },
    {
        id: 'dev',
        getLabel: (row?: Config) => 'Dev',
        minWidth: 150,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.envOverride.dev?.value || '',
    },
    {
        id: 'stage',
        getLabel: (row?: Config) => 'Stage',
        minWidth: 150,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.envOverride.stage?.value || '',
    },
    {
        id: 'prod',
        getLabel: (row?: Config) => 'Prod',
        minWidth: 150,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.envOverride.prod?.value || '',
    },
];

export const getDeployConfigColumns = (): any[] => [
    {
        id: 'deployConfType',
        getLabel: (row: any) => 'Type',
        minWidth: 250,
        align: 'left',
        paddingLeft: 0,
        getValue: (row: any) => row.type?.toUpperCase(),
    },
    {
        id: 'default',
        getLabel: (row?: any) => 'Default',
        minWidth: 50,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: any) => {
            return row.default || '';
        },
    },
    {
        id: 'dev',
        getLabel: (row?: Config) => 'Dev',
        minWidth: 50,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.envOverride.dev || '',
    },
    {
        id: 'stage',
        getLabel: (row?: any) => 'Stage',
        minWidth: 50,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.envOverride.stage || '',
    },
    {
        id: 'prod',
        getLabel: (row?: any) => 'Prod',
        minWidth: 50,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.envOverride.prod || '',
    },
];
