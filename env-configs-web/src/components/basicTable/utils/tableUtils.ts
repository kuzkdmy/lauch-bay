import { Config } from '../../../types/types';

export const getColUpdateValue = (
    value: any,
    configRow: Config,
    colId: string
): Config => {
    // todo refactor
    switch (colId) {
        case 'dev':
            return {
                ...configRow,
                envOverride: {
                    ...configRow.envOverride,
                    dev: { value },
                },
            };
        case 'stage':
            return {
                ...configRow,
                envOverride: {
                    ...configRow.envOverride,
                    stage: { value },
                },
            };
        case 'prod':
            return {
                ...configRow,
                envOverride: {
                    ...configRow.envOverride,
                    prod: { value },
                },
            };
        case 'default':
            return {
                ...configRow,
                [colId]: { value },
            };
        default:
            return { ...configRow, [colId]: value };
    }
};
