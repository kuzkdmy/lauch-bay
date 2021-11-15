import { Config } from '../../types/types';

export const columnsConfig = (): any[] => [
    {
        id: 'envKey',
        label: 'Name',
        minWidth: 210,
        align: 'left',
        paddingLeft: 0,
        getValue: (row: any) => row.envKey || '',
    },
    {
        id: 'type',
        label: 'Type',
        minWidth: 80,
        align: 'center',
        getValue: (row: Config) => row.type || '',
    },
    {
        id: 'default',
        label: 'Default',
        minWidth: 150,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.default?.value,
    },
    {
        id: 'dev',
        label: 'Dev',
        minWidth: 150,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.envOverride.dev?.value || '',
    },
    {
        id: 'stage',
        label: 'Stage',
        minWidth: 150,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.envOverride.stage?.value || '',
    },
    {
        id: 'prod',
        label: 'Prod',
        minWidth: 150,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.envOverride.prod?.value || '',
    },
];
