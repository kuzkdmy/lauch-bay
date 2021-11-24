import React, { FC, useState } from 'react';
import TabsPanel from '../common-components/tabsPanel/TabsPanel';
import EditableTable from '../common-components/editableTable/EditableTable';
import { Configs, ConfigType, TabItemType } from '../../types/types';
import { useTypedSelector } from '../../redux/hooks/useTypedSelector';
import {
    getDeployConfigColumns,
    getEnvConfigColumns,
} from '../utils/tableConfig';
import {
    updateDeploymentConfColValue,
    updateEnvConfColValue,
} from '../utils/tableUtils';
import DeploymentsConfigsTab from './deploymentsConfigsTab/DeploymentsConfigTab';

interface ConfigSubTabsProps {
    parentTab: TabItemType;
    config: Configs;
}

const ConfigSubTabs: FC<ConfigSubTabsProps> = ({ parentTab, config }) => {
    const subTabs = [
        { id: 'env-configs-id', name: 'Environment Configs' },
        {
            id: 'env-deployments-id',
            name: 'Kubernetes Deployments',
        },
    ];

    const [activeTab, setActiveTab] = useState('env-configs-id');
    const { editTabs } = useTypedSelector((state) => state.tabState);

    const getTable = (
        columns: any,
        configRows,
        sx: any,
        updateColValue: any,
        tableEditableRows: any,
        isDeletable?: boolean
    ) => {
        return (
            <EditableTable
                key={0}
                columns={columns}
                config={configRows}
                isDeletable={isDeletable}
                updateColValue={updateColValue}
                activeTabId={parentTab.id}
                tableEditableRows={tableEditableRows}
                sx={sx}
                tabItem={parentTab}
            />
        );
    };

    const getEnvConfTable = (maxHeight: string) => {
        return getTable(
            getEnvConfigColumns(),
            config.envConf,
            {
                maxHeight: maxHeight,
                width: '100%',
            },
            updateEnvConfColValue,
            {
                name: 'envConf',
                configs: editTabs[parentTab.id]?.envConf,
                dependentConfName: 'deployConf',
                dependentConf: editTabs[parentTab.id]?.deployConf,
            },
            true
        );
    };

    const getDeploymentsConfTable = () => {
        return getTable(
            getDeployConfigColumns(),
            config.deployConf,
            {
                marginBottom: '25px',
                maxHeight: '60vh',
                width: '700px',
            },
            updateDeploymentConfColValue,
            {
                name: 'deployConf',
                configs: editTabs[parentTab.id]?.deployConf,
                dependentConfName: 'envConf',
                dependentConf: editTabs[parentTab.id]?.envConf,
            }
        );
    };

    const getTableCont = () => {
        return [
            { content: getEnvConfTable('74vh') },
            {
                content: <DeploymentsConfigsTab parentTab={parentTab} />,
            },
        ];
    };

    return parentTab.type === ConfigType.APPLICATION ? (
        <TabsPanel
            tabsContent={() => getTableCont()}
            tabs={subTabs}
            onTabChange={(event: any, index: number) => {
                setActiveTab(subTabs[index].id);
            }}
            activeTabId={activeTab}
            onTabClick={() => {}}
        />
    ) : (
        getEnvConfTable('82vh')
    );
};

export default ConfigSubTabs;
