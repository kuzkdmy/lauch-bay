import React, { FC } from 'react';
import EditableTable from '../common-components/editableTable/EditableTable';
import { Configs, ConfigType, TabItemType } from '../../types/types';
import { getEnvConfigColumns } from '../utils/tableConfig';
import { updateEnvConfColValue } from '../utils/tableUtils';
import DeploymentsConfigsTab from './deploymentsConfigTab/DeploymentsConfigTab';
import CollapsePanel from '../common-components/collapsePanel/CollapsePanel';
import { useTypedSelector } from '../../redux/hooks/useTypedSelector';

interface ConfigSubTabsProps {
    parentTab: TabItemType;
    config: Configs;
}

const ConfigsTabContent: FC<ConfigSubTabsProps> = ({ parentTab, config }) => {
    const { collapsiblePanelState } = useTypedSelector(
        (state) => state.tabState
    );

    const getApplicationContent = () => {
        const kubDeploymentsPanelId = `${parentTab.id}_Kubernetes Deployments`;
        const envConfPanelId = `${parentTab.id}_Environment Configs`;

        return (
            <div>
                <CollapsePanel
                    parentId={parentTab.id}
                    isOpen={
                        collapsiblePanelState[kubDeploymentsPanelId] ===
                        undefined
                            ? true
                            : collapsiblePanelState[kubDeploymentsPanelId]
                    }
                    name="Kubernetes Deployments"
                    getContent={() => (
                        <DeploymentsConfigsTab parentTab={parentTab} />
                    )}
                />
                <CollapsePanel
                    name="Environment Configs"
                    isOpen={
                        collapsiblePanelState[envConfPanelId] === undefined
                            ? true
                            : collapsiblePanelState[envConfPanelId]
                    }
                    parentId={parentTab.id}
                    getContent={() => (
                        <EditableTable
                            key={0}
                            columns={getEnvConfigColumns()}
                            config={config?.envConf}
                            updateColValue={updateEnvConfColValue}
                            activeTabId={parentTab.id}
                            sx={{
                                maxHeight: '82vh',
                                width: '100%',
                            }}
                            tabItem={parentTab}
                        />
                    )}
                />
            </div>
        );
    };

    return parentTab?.type === ConfigType.APPLICATION ? (
        getApplicationContent()
    ) : (
        <EditableTable
            key={0}
            columns={getEnvConfigColumns()}
            config={config?.envConf}
            updateColValue={updateEnvConfColValue}
            activeTabId={parentTab.id}
            sx={{
                maxHeight: '82vh',
                width: '100%',
            }}
            tabItem={parentTab}
        />
    );
};

export default ConfigsTabContent;
