import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@mui/material';
import TabsPanel from '../common-components/tabsPanel/TabsPanel';
import { ConfigType, TabItemType } from '../../types/types';
import { useActions } from '../../redux/hooks/useActions';
import { useTypedSelector } from '../../redux/hooks/useTypedSelector';
import ConfigListItems from './ConfigListItems';
import CreateNewDialog from '../createNewConfigDialog/CreateNewConfigDialog';
import ConfigsTabHeader from './ConfigsTabHeader';
import { addNewRowToConfig } from '../../redux/actions/tabActions';
import ConfigSubTabs from './ConfigSubTabs';

const ConfigTabs = () => {
    const { openedTabs, activeTabId } = useTypedSelector(
        (state) => state.tabState
    );

    const [isEdit, setIsEdit] = useState(false);
    const [isDialogOpened, setIsDialogOpened] = useState(false);
    const [confToCreate, setConfToCreate] = useState<any>();
    const [showInherited, setShowInherited] = useState(false);
    const { addNewRowToConfig, fetchConfigs, updateConfig, setActiveTabId } =
        useActions();

    const { editTabs } = useTypedSelector((state) => state.tabState);
    const { configs } = useTypedSelector((state) => state.configsState);

    const tabsContent = useMemo(() => openedTabs, [openedTabs]);

    const resetState = () => {
        setIsEdit(false);
        setShowInherited(false);
    };

    useEffect(() => {
        setIsEdit(!!editTabs[activeTabId]);
    }, [editTabs, activeTabId]);

    // const getParentConfigs = (
    //     config: Configs,
    //     parentConfigs: any,
    //     type: ConfigType
    // ) => {
    //     return (
    //         <>
    //             <div className="parent-config">{type} config</div>
    //             <EditableTable sx={{ marginBottom: '25px' }} menuItem={menu} />
    //         </>
    //     );
    // };

    const renderTableTabsContent = (tabItem: TabItemType) => {
        return (
            <div className="tabs-content-container">
                <ConfigsTabHeader
                    isEdit={isEdit}
                    setIsEdit={setIsEdit}
                    showInherited={showInherited}
                    onAddNewRow={() => {
                        addNewRowToConfig(tabItem.id);
                    }}
                    onSave={() => updateConfig(editTabs[tabItem.id])}
                    setShowInherited={setShowInherited}
                    tabItem={tabItem}
                />
                <ConfigSubTabs
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
            if (item.isTableContent) {
                return {
                    tabName: item.name,
                    content: renderTableTabsContent(item),
                };
            }
            if (item.id === 'projects-id') {
                return {
                    tabName: item.name,
                    content: renderListTabsContent(),
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
