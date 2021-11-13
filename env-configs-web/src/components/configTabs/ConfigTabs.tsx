import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@mui/material';
import TabsPanel from '../tabsPanel/TabsPanel';
import {
    Configs,
    ConfigType,
    MenuItemType,
    TabContent,
} from '../../types/types';
import { useActions } from '../../redux/hooks/useActions';
import { useTypedSelector } from '../../redux/hooks/useTypedSelector';
import EditableTable from '../basicTable/EditableTable';
import ProjectItems from './ProjectItems';
import { mergeConfigs } from './utils/configTabsUtils';
import CreateNewDialog from '../createNewConfigDialog/CreateNewConfigDialog';
import ConfigsTabSubHeader from './ConfigsTabSubHeader';
import { addNewRowToConfig } from '../../redux/actions/menuActions';

const ConfigTabs = () => {
    const { openedTabs, activeTabId } = useTypedSelector((state) => state.menu);

    const [isEdit, setIsEdit] = useState(false);
    const [isDialogOpened, setIsDialogOpened] = useState(false);
    const [confToCreate, setConfToCreate] = useState<any>();
    const [showGlobal, setShowGlobal] = useState(false);
    const [showProject, setShowProject] = useState(false);

    const { editTabs } = useTypedSelector((state) => state.menu);
    const { configs } = useTypedSelector((state) => state.configsState);
    const { addNewRowToConfig, fetchConfigs, updateConfig } = useActions();
    const tabsContent = useMemo(() => openedTabs, [openedTabs]);

    const resetState = () => {
        setIsEdit(false);
        setShowProject(false);
        setShowGlobal(false);
    };

    useEffect(() => {
        setIsEdit(!!editTabs[activeTabId]);
    }, [editTabs, activeTabId]);

    const getParentConfigs = (
        config: Configs,
        parentConfigs: any,
        type: ConfigType
    ) => {
        return (
            <>
                <div className="parent-config">{type} config</div>
                <EditableTable
                    sx={{ marginBottom: '25px' }}
                    // isEdit={false}
                    // item={config[]}
                />
            </>
        );
    };

    const renderTableTabsContent = (
        menuItem: MenuItemType,
        config: Configs
    ) => {
        return (
            <div className="tabs-content-container">
                <ConfigsTabSubHeader
                    isEdit={isEdit}
                    setIsEdit={setIsEdit}
                    showGlobal={showGlobal}
                    onAddNewRow={() => {
                        addNewRowToConfig(menuItem.id);
                    }}
                    onSave={() => updateConfig(editTabs[menuItem.id])}
                    setShowGlobal={setShowGlobal}
                    showProject={showProject}
                    setShowProject={setShowProject}
                    menuItem={menuItem}
                />
                <EditableTable
                    sx={{ marginBottom: '25px', maxHeight: '60vh' }}
                    // isEdit={isEdit}
                    // item={config}
                />
                {/* {item.hasGlobalConfigType && */}
                {/*    showGlobal && */}
                {/*    getParentConfigs(config, configs.GLOBAL, ConfigType.GLOBAL)} */}
                {/* {item.hasProjectConfigType && */}
                {/*    showProject && */}
                {/*    getParentConfigs( */}
                {/*        config as Configs, */}
                {/*        _.find(configs.PROJECT, (el) => { */}
                {/*            return el.id === config.projectId; */}
                {/*        }) as Configs, */}
                {/*        ConfigType.PROJECT */}
                {/*    )} */}
            </div>
        );
    };

    const renderListTabsContent = (items?: Configs[]) => {
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
                {Array.isArray(items)
                    ? items?.map((item, index) => (
                          <ProjectItems
                              project={item}
                              key={index}
                              pl={2}
                              isTopLevel
                              index={index}
                              showCreateNewDialog={() => {
                                  setConfToCreate({
                                      type: ConfigType.APPLICATION,
                                      projectId: item.id,
                                  });
                                  setIsDialogOpened(true);
                              }}
                          />
                      ))
                    : null}
            </>
        );
    };

    const getTabItems = () => {
        return tabsContent.map((item: MenuItemType): any => {
            if (!configs[item.id]) {
                return {};
            }
            if (item.isTableContent) {
                return {
                    tabName: item.name,
                    content: renderTableTabsContent(item, configs[item.id]!),
                };
            }
            return {
                tabName: item.name,
                content: renderListTabsContent(configs[item.id]),
            };
        });
    };

    return (
        <TabsPanel
            tabsContent={getTabItems}
            activeTabId={activeTabId}
            onChange={resetState}
            onTabClick={(
                type = ConfigType.GLOBAL,
                name: string,
                id: string
            ) => {
                fetchConfigs({
                    type,
                    id,
                    name,
                });
            }}
        />
    );
};

export default ConfigTabs;
