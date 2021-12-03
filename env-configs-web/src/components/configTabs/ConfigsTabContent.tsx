import React, { FC, useEffect, useState } from 'react';
import EditableTable from '../common-components/editableTable/EditableTable';
import { Configs, ConfigType, TabItemType } from '../../types/types';
import { getEnvConfigColumns } from '../utils/tableConfig';
import { updateEnvConfColValue } from '../utils/tableUtils';
import DeploymentsConfigsTab from './deploymentsConfigTab/DeploymentsConfigTab';
import CollapsePanel from '../common-components/collapsePanel/CollapsePanel';
import { useTypedSelector } from '../../redux/hooks/useTypedSelector';
import { mergeConfigs } from '../utils/configTabsUtils';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

interface ConfigSubTabsProps {
    parentTab: TabItemType;
    config: Configs;
}

const ConfigsTabContent: FC<ConfigSubTabsProps> = ({ parentTab, config }) => {
    const { collapsiblePanelState } = useTypedSelector(
        (state) => state.tabState
    );

    const { configs } = useTypedSelector((state) => state.configsState);

    const [showInherited, setShowInherited] = useState(false);

    useEffect(() => {
        setShowInherited(false);
    }, [configs]);

    const isCollapsed = (panelId: string) => {
        return collapsiblePanelState[panelId] === undefined
            ? true
            : collapsiblePanelState[panelId];
    };

    const renderShowInheritedConf = () => {
        return (
            <FormGroup sx={{ margin: '15px 10px', width: '210px' }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            size="small"
                            checked={showInherited}
                            onChange={() => setShowInherited(!showInherited)}
                        />
                    }
                    label="Show Inherited Config"
                />
            </FormGroup>
        );
    };

    const renderTabContent = () => ({
        [ConfigType.GLOBAL]: () => {
            return (
                <EditableTable
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
        },
        [ConfigType.PROJECT]: () => {
            return renderConfWithInheritedConfs(
                config,
                configs[ConfigType.GLOBAL]['global-id']
            );
        },
        [ConfigType.APPLICATION]: () => {
            return renderApplicationContent();
        },
    });

    const renderConfWithInheritedConfs = (conf, inheritedConf) => {
        return (
            <div>
                {renderShowInheritedConf()}
                <EditableTable
                    columns={getEnvConfigColumns()}
                    config={config?.envConf}
                    updateColValue={updateEnvConfColValue}
                    activeTabId={parentTab.id}
                    sx={{
                        maxHeight: '82vh',
                        width: '100%',
                        marginBottom: '25px',
                    }}
                    tabItem={parentTab}
                />
                {showInherited && (
                    <EditableTable
                        columns={getEnvConfigColumns()}
                        isParentConfigs
                        config={mergeConfigs(conf, inheritedConf).envConf}
                        updateColValue={() => {}}
                        activeTabId={parentTab.id}
                        sx={{
                            maxHeight: '82vh',
                            width: '100%',
                        }}
                        tabItem={parentTab}
                    />
                )}
            </div>
        );
    };

    const renderApplicationContent = () => {
        const kubDeploymentsPanelId = `${parentTab.id}_Kubernetes Deployments`;
        const envConfPanelId = `${parentTab.id}_Environment Configs`;
        const projConf = configs[ConfigType.PROJECT][config.projectId!];
        const globalConf = configs[ConfigType.GLOBAL]['global-id'];
        return (
            <div>
                <CollapsePanel
                    parentId={parentTab.id}
                    isOpen={isCollapsed(kubDeploymentsPanelId)}
                    name="Kubernetes Deployments"
                >
                    <DeploymentsConfigsTab parentTab={parentTab} />
                </CollapsePanel>
                <CollapsePanel
                    name="Environment Configs"
                    isOpen={isCollapsed(envConfPanelId)}
                    parentId={parentTab.id}
                >
                    {renderConfWithInheritedConfs(
                        mergeConfigs(config, projConf),
                        globalConf
                    )}
                </CollapsePanel>
            </div>
        );
    };

    return renderTabContent()[parentTab.type]();
};

export default ConfigsTabContent;
