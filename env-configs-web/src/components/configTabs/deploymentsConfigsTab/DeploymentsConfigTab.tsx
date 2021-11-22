import React, { FC, useMemo } from 'react';
import DeploymentConfig from './deploymentConfig/DeploymentConfig';
import { Config, ConfigType, TabItemType } from '../../../types/types';
import _ from 'lodash';
import { editDeploymentConfigItem } from '../../../redux/actions/tabActions';
import { useActions } from '../../../redux/hooks/useActions';
import { useTypedSelector } from '../../../redux/hooks/useTypedSelector';

interface DeploymentsConfigTab {
    parentTab: TabItemType;
}

const DeploymentsConfigsTab: FC<DeploymentsConfigTab> = ({ parentTab }) => {
    const { editTabs } = useTypedSelector((state) => state.tabState);
    const { configs } = useTypedSelector((state) => state.configsState);

    const appConfig = useMemo(() => {
        return (
            editTabs[parentTab.id] ||
            configs[ConfigType.APPLICATION][parentTab.id]
        );
    }, [configs, editTabs, parentTab.id]);

    const replica = useMemo(
        () => _.find(appConfig.deployConf, { type: 'replica' }),
        [appConfig]
    );
    const requestCpu = useMemo(
        () => _.find(appConfig.deployConf, { type: 'request_cpu' }),
        [appConfig]
    );
    const limitCpu = useMemo(
        () => _.find(appConfig.deployConf, { type: 'limit_cpu' }),
        [appConfig]
    );
    const requestRam = useMemo(
        () => _.find(appConfig.deployConf, { type: 'request_ram' }),
        [appConfig]
    );
    const limitRam = useMemo(
        () => _.find(appConfig.deployConf, { type: 'limit_ram' }),
        [appConfig]
    );
    const emptyDirMem = useMemo(
        () => _.find(appConfig.deployConf, { type: 'empty_dir_memory' }),
        [appConfig]
    );
    const javaOpts = useMemo(
        () => _.find(appConfig.deployConf, { type: 'java_opts' }),
        [appConfig]
    );

    const { editDeploymentConfigItem } = useActions();

    const onEdit = (conf) => {
        const appConfig = configs[ConfigType.APPLICATION][parentTab.id];
        editDeploymentConfigItem(
            {
                ...appConfig,
                confType: parentTab.type,
            },
            conf,
            true
        );
    };

    const renderDeploymentConfig = (config: Config) => {
        return (
            <DeploymentConfig
                config={config}
                onConfigEdit={onEdit}
                className="deployment-config"
            />
        );
    };

    return (
        <div className="deployment-confs-tab">
            <div className="deployment-confs-tab-content">
                <div className="deployment-confs">
                    {renderDeploymentConfig(replica)}
                    {renderDeploymentConfig(requestCpu)}
                    {renderDeploymentConfig(limitCpu)}
                </div>
                <div className="deployment-confs">
                    {renderDeploymentConfig(requestRam)}
                    {renderDeploymentConfig(limitRam)}
                    {renderDeploymentConfig(emptyDirMem)}
                </div>
                <div className="full-width">
                    {renderDeploymentConfig(javaOpts)}
                </div>
            </div>
        </div>
    );
};

export default DeploymentsConfigsTab;
