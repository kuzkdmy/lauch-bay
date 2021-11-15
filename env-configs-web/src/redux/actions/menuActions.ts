import {
    Configs,
    ConfigType,
    MenuActions,
    MenuActionTypes,
    MenuItemType,
} from '../../types/types';

export const openMenu = (content: MenuItemType): MenuActions => ({
    type: MenuActionTypes.OPEN_TAB,
    payload: { ...content },
});

export const openCreateNewItemTab = (
    name: string,
    id: string,
    confType: ConfigType,
    projectId?: string
): MenuActions => ({
    type: MenuActionTypes.OPEN_CREATE_NEW_CONFIG,
    payload: { name, id, confType, projectId },
});

export const addNewRowToConfig = (id: string): MenuActions => ({
    type: MenuActionTypes.ADD_NEW_ROW_TO_CONFIG,
    payload: { id },
});

export const editConfigItem = (
    config: Configs,
    isEdit: boolean
): MenuActions => ({
    type: MenuActionTypes.EDIT_CONFIG_ROW,
    payload: { config: config, isEdit },
});

export const removeTabFromEditState = (id: string): MenuActions => ({
    type: MenuActionTypes.EDIT_CONFIG_ROW,
    payload: { config: { id } },
});

export const collapsiblePanelClick = (
    item: MenuItemType,
    isOpen: boolean
): MenuActions => ({
    type: MenuActionTypes.COLLAPSIBLE_ITEM_CLICK,
    payload: { item, isOpen },
});

export const setActiveTabId = (tabId: string): MenuActions => ({
    type: MenuActionTypes.SET_ACTIVE_TAB,
    payload: tabId,
});

export const closeTab = (content: MenuItemType): MenuActions => ({
    type: MenuActionTypes.CLOSE_TAB,
    payload: { ...content },
});
