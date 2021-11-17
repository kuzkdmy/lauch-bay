import {
    Configs,
    ConfigType,
    TabsActions,
    TabsActionTypes,
    TabItemType,
} from '../../types/types';

export const openTab = (content: TabItemType): TabsActions => ({
    type: TabsActionTypes.OPEN_TAB,
    payload: { ...content },
});

export const openCreateNewItemTab = (
    name: string,
    id: string,
    confType: ConfigType,
    projectId?: string
): TabsActions => ({
    type: TabsActionTypes.OPEN_CREATE_NEW_CONFIG,
    payload: { name, id, confType, projectId },
});

export const addNewRowToConfig = (id: string): TabsActions => ({
    type: TabsActionTypes.ADD_NEW_ROW_TO_CONFIG,
    payload: { id },
});

export const editConfigItem = (
    config: Configs,
    isEdit: boolean
): TabsActions => ({
    type: TabsActionTypes.EDIT_CONFIG_ROW,
    payload: { config: config, isEdit },
});

export const removeTabFromEditState = (id: string): TabsActions => ({
    type: TabsActionTypes.EDIT_CONFIG_ROW,
    payload: { config: { id } },
});

export const collapsiblePanelClick = (
    item: TabItemType,
    isOpen: boolean
): TabsActions => ({
    type: TabsActionTypes.COLLAPSIBLE_ITEM_CLICK,
    payload: { item, isOpen },
});

export const setActiveTabId = (tabId: string): TabsActions => ({
    type: TabsActionTypes.SET_ACTIVE_TAB,
    payload: tabId,
});

export const closeTab = (content: TabItemType): TabsActions => ({
    type: TabsActionTypes.CLOSE_TAB,
    payload: { ...content },
});
