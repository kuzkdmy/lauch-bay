import { Config } from '../../types/types';

export const getEnvConfigColumns = (): any[] => [
    {
        id: 'envKey',
        getLabel: (row?: Config) => 'Name',
        minWidth: 400,
        sortable: true,
        align: 'left',
        paddingLeft: 0,
        getValue: (row: any) => row.envKey || '',
    },
    {
        id: 'type',
        getLabel: (row?: Config) => 'Type',
        minWidth: 110,
        align: 'center',
        getValue: (row: Config) => row.type || '',
    },
    {
        id: 'default',
        getLabel: (row?: Config) => 'Default',
        minWidth: 250,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.default?.value,
    },
    {
        id: 'dev',
        getLabel: (row?: Config) => 'Dev',
        minWidth: 250,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.envOverride.dev?.value || '',
    },
    {
        id: 'stage',
        getLabel: (row?: Config) => 'Stage',
        minWidth: 250,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.envOverride.stage?.value || '',
    },
    {
        id: 'prod',
        getLabel: (row?: Config) => 'Prod',
        minWidth: 250,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.envOverride.prod?.value || '',
    },
];
