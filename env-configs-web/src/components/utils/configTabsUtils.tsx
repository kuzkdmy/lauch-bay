import { Config, Configs, ConfigType, TabItemType } from '../../types/types';
import _, { isBoolean } from 'lodash';

export const getEmptyConfigRow = (): Configs => ({
    id: '',
    projectId: '',
    name: '',
    envConf: [],
    deployConf: [],
    confType: ConfigType.PROJECT,
    version: 0,
});

export const getEmptyEnvConf = (defaultVal: any) => ({
    envKey: '',
    type: 'string',
    default: defaultVal,
    isDisabled: true,
    envOverride: {
        dev: null,
        stage: null,
        prod: null,
    },
});

export const kubDeploymentsPanelId = (parentTabId: string) =>
    `${parentTabId}_Kubernetes Deployments`;
export const envConfPanelId = (parentTabId: string) =>
    `${parentTabId}_Environment Configs`;

const getConfigValue = (val1 = '', val2: any) => {
    if (isBoolean(val1) || isBoolean(val2)) {
        if (val1 !== undefined && val2 !== undefined) {
            return `${val1} -> ${val2}`;
        }
        return (
            (val1 !== undefined && `${val1}`) ||
            (val2 !== undefined && `${val2}`)
        );
    }
    if (!val2) {
        return val1;
    }
    return val1 ? `${val1} -> ${val2}` : `${val2}`;
};

const merge = (p: Config, confOverride) => {
    return {
        ...p,
        default: {
            value: getConfigValue(
                p.default?.value,
                confOverride?.default?.value
            ),
        },
        envOverride: {
            dev: {
                value: getConfigValue(
                    p.envOverride.dev?.value,
                    confOverride?.envOverride.dev?.value
                ),
            },
            prod: {
                value: getConfigValue(
                    p.envOverride.prod?.value,
                    confOverride?.envOverride.prod?.value
                ),
            },
            stage: {
                value: getConfigValue(
                    p.envOverride.stage?.value,
                    confOverride?.envOverride.stage?.value
                ),
            },
        },
    };
};

export const mergeConfigs = (
    config: Config[],
    parentConfigs: Config[]
): Config[] => {
    const configUniquePropNames = _.difference(
        config?.map((prop) => prop.envKey),
        parentConfigs?.map((prop) => prop.envKey)
    );
    const overriddenParentEnvConf = parentConfigs?.map((p: Config) => {
        const confOverride = _.find(
            config,
            (conf: Config) => conf.envKey === p.envKey
        );
        return merge(p, confOverride);
    }) as Config[];

    const uniqueConfigEnvConf = configUniquePropNames?.map((propName) => {
        return merge(_.find(config, { envKey: propName })!, undefined);
    }) as Config[];

    return [...overriddenParentEnvConf, ...uniqueConfigEnvConf];
};

export const addEmptyDeployments = (deploymentConf: Config[]) => {
    return [
        {
            ...(_.find(deploymentConf, { type: 'replica' }) ||
                getEmptyEnvConf(0)),
            type: 'replica',
        },
        {
            ...(_.find(deploymentConf, { type: 'request_cpu' }) ||
                getEmptyEnvConf(0)),
            type: 'request_cpu',
        },
        {
            ...(_.find(deploymentConf, { type: 'limit_cpu' }) ||
                getEmptyEnvConf(0)),
            type: 'limit_cpu',
        },
        {
            ...(_.find(deploymentConf, { type: 'request_ram' }) ||
                getEmptyEnvConf(0)),
            type: 'request_ram',
        },
        {
            ...(_.find(deploymentConf, { type: 'limit_ram' }) ||
                getEmptyEnvConf(0)),
            type: 'limit_ram',
        },
        {
            ...(_.find(deploymentConf, { type: 'java_opts' }) ||
                getEmptyEnvConf('')),
            type: 'java_opts',
        },
        {
            ...(_.find(deploymentConf, { type: 'empty_dir_memory' }) ||
                getEmptyEnvConf(false)),
            type: 'empty_dir_memory',
        },
    ];
};

export const replaceDeployConf = (conf, deployConf: Config[]): Config[] => {
    if (!conf) {
        return deployConf;
    }

    const confIdx = _.findIndex(deployConf, { type: conf.type });
    deployConf.splice(confIdx, 1, conf);

    return deployConf;
};
