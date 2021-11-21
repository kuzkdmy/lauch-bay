import React, { FC, useEffect, useMemo, useState } from 'react';
import DeploymentConfig from './deploymentConfig/DeploymentConfig';
import { ConfigType, TabItemType } from '../../../types/types';
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

    const [appConfig, setAppConfig] = useState(
        configs[ConfigType.APPLICATION][parentTab.id]
    );

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

    useEffect(() => {
        if (editTabs[parentTab.id]) {
            setAppConfig(editTabs[parentTab.id]);
        } else {
            setAppConfig(configs[ConfigType.APPLICATION][parentTab.id]);
        }
    }, [configs, editTabs, parentTab.id]);

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

    return (
        <div className="deployment-confs-tab">
            <div className="deployment-confs-tab-content">
                <div className="deployment-confs">
                    <DeploymentConfig
                        config={replica}
                        onConfigEdit={onEdit}
                        className="deployment-config"
                    />
                    <DeploymentConfig
                        onConfigEdit={onEdit}
                        config={requestCpu}
                        className="deployment-config"
                    />
                    <DeploymentConfig
                        onConfigEdit={onEdit}
                        config={limitCpu}
                        className="deployment-config"
                    />
                </div>
                <div className="deployment-confs">
                    <DeploymentConfig
                        onConfigEdit={onEdit}
                        config={requestRam}
                        className="deployment-config"
                    />
                    <DeploymentConfig
                        onConfigEdit={onEdit}
                        config={limitRam}
                        className="deployment-config"
                    />
                    <DeploymentConfig
                        onConfigEdit={onEdit}
                        config={emptyDirMem}
                        className="deployment-config"
                    />
                </div>
                <div className="full-width">
                    <DeploymentConfig
                        onConfigEdit={onEdit}
                        config={javaOpts}
                        className="deployment-config"
                    />
                </div>
            </div>
        </div>
    );
};

export default DeploymentsConfigsTab;
