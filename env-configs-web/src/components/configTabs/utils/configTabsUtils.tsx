import { Config, Configs, ConfigType, TabItemType } from '../../../types/types';
import _ from 'lodash';

export const getEmptyConfigRow = (): Configs => ({
    id: '',
    projectId: '',
    name: '',
    envConf: [],
    deployConf: [],
    confType: ConfigType.PROJECT,
    version: 0,
});

export const getEmptyEnvConf = () => ({
    envKey: '',
    type: 'string',
    default: null,
    envOverride: {
        dev: null,
        stage: null,
        prod: null,
    },
});

const getConfigValue = (val1: any, val2: any) => {
    if (!val2) {
        return val1;
    }
    return `${val1} -> ${val2}`;
};

export const mergeConfigs = (
    config: Configs,
    parentConfigs: any = {}
): Configs => {
    const overriddenEnvConf = parentConfigs?.envConf.map((p: Config) => {
        const confOverride = _.find(
            config.envConf,
            (conf: Config) => conf.envKey === p.envKey
        );
        if (!confOverride) {
            return p;
        }
        return {
            ...p,
            envOverride: {
                dev: {
                    ...p.envOverride.dev,
                    value: getConfigValue(
                        p.envOverride.dev?.value,
                        confOverride.envOverride.dev?.value
                    ),
                },
                prod: {
                    ...p.envOverride.dev,
                    value: getConfigValue(
                        p.envOverride.prod?.value,
                        confOverride.envOverride.prod?.value
                    ),
                },
                stage: {
                    ...p.envOverride.dev,
                    value: getConfigValue(
                        p.envOverride.stage?.value,
                        confOverride.envOverride.stage?.value
                    ),
                },
            },
        };
    }) as Config[];

    return { ...parentConfigs, envConf: overriddenEnvConf };
};

export const addEmptyDeployments = (deploymentConf: Config[]) => {
    return [
        {
            ...(_.find(deploymentConf, { type: 'replica' }) ||
                getEmptyEnvConf()),
            type: 'replica',
        },
        {
            ...(_.find(deploymentConf, { type: 'request_cpu' }) ||
                getEmptyEnvConf()),
            type: 'request_cpu',
        },
        {
            ...(_.find(deploymentConf, { type: 'limit_cpu' }) ||
                getEmptyEnvConf()),
            type: 'limit_cpu',
        },
        {
            ...(_.find(deploymentConf, { type: 'request_ram' }) ||
                getEmptyEnvConf()),
            type: 'request_ram',
        },
        {
            ...(_.find(deploymentConf, { type: 'limit_ram' }) ||
                getEmptyEnvConf()),
            type: 'limit_ram',
        },
        {
            ...(_.find(deploymentConf, { type: 'java_opts' }) ||
                getEmptyEnvConf()),
            type: 'java_opts',
        },
        {
            ...(_.find(deploymentConf, { type: 'empty_dir_memory' }) ||
                getEmptyEnvConf()),
            type: 'empty_dir_memory',
        },
    ];
};
