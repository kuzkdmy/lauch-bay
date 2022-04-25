import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@mui/material';
import TabsPanel from '../common-components/tabsPanel/TabsPanel';
import { ConfigType, TabItemType } from '../../types/types';
import { useActions } from '../../redux/hooks/useActions';
import { useTypedSelector } from '../../redux/hooks/useTypedSelector';
import ConfigListItems from './configList/ConfigListItems';
import CreateNewDialog from '../createNewConfigDialog/CreateNewConfigDialog';
import ConfigsTabHeader from './ConfigsTabHeader';
import ConfigsTabContent from './ConfigsTabContent';

const ConfigTabs = () => {
    const { openedTabs, activeTabId } = useTypedSelector(
        (state) => state.tabState
    );

    const [isDialogOpened, setIsDialogOpened] = useState(false);
    const [confToCreate, setConfToCreate] = useState<any>();
    const [showInherited, setShowInherited] = useState(false);
    const { updateConfig, setActiveTabId, fetchConfigs } = useActions();

    const { editTabs, collapsiblePanelState } = useTypedSelector(
        (state) => state.tabState
    );
    const { configs } = useTypedSelector((state) => state.configsState);

    const tabsContent = useMemo(() => openedTabs, [openedTabs]);

    const resetState = () => {
        setShowInherited(false);
    };

    const renderTableTabsContent = (tabItem: TabItemType) => {
        return (
            <div className="tabs-content-container">
                <ConfigsTabHeader
                    showInherited={showInherited}
                    onSave={() => updateConfig(editTabs[tabItem.id])}
                    setShowInherited={setShowInherited}
                    tabItem={tabItem}
                />
                <ConfigsTabContent
                    config={configs[tabItem.type][tabItem.id]}
                    parentTab={tabItem}
                />
            </div>
        );
    };

    const renderListTabsContent = () => {
        return (
            <>
                <CreateNewDialog
                    isOpened={isDialogOpened}
                    configType={confToCreate}
                    onClose={() => setIsDialogOpened(false)}
                />
                <Button
                    sx={{ marginBottom: '20px' }}
                    size="small"
                    variant="outlined"
                    onClick={() => {
                        setConfToCreate({
                            type: ConfigType.PROJECT,
                        });
                        setIsDialogOpened(true);
                    }}
                >
                    Add New Project
                </Button>
                {Object.keys(configs[ConfigType.PROJECT])
                    .map((key) => configs[ConfigType.PROJECT][key])
                    .map((config, index) => (
                        <ConfigListItems
                            project={config}
                            isOpen={collapsiblePanelState[config.id]}
                            key={index}
                            pl={2}
                            isTopLevel
                            index={index}
                            showCreateNewDialog={() => {
                                setConfToCreate({
                                    type: ConfigType.APPLICATION,
                                    projectId: config.id,
                                });
                                setIsDialogOpened(true);
                            }}
                        />
                    ))}
            </>
        );
    };

    const onTabChange = (index: number) => {
        setActiveTabId(openedTabs[index].id);
        resetState();
    };

    const getTabItems = () => {
        return tabsContent.map((item: TabItemType): any => {
            if (item.id === 'projects-id') {
                return {
                    tabName: item.name,
                    content: renderListTabsContent(),
                };
            } else {
                return {
                    tabName: item.name,
                    content: renderTableTabsContent(item),
                };
            }
        });
    };

    return (
        <TabsPanel
            tabsContent={getTabItems}
            tabs={openedTabs}
            activeTabId={activeTabId}
            isTitleUpperCase={true}
            onTabChange={(event: any, tabIndex: number) =>
                onTabChange(tabIndex)
            }
            isClosable
            onTabClick={(
                type = ConfigType.GLOBAL,
                name: string,
                id: string
            ) => {
                if (!editTabs[id]) {
                    fetchConfigs({
                        type,
                        id,
                        name,
                    });
                }
            }}
        />
    );
};

export default ConfigTabs;
