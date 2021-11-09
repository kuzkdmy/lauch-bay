import { FIND_ITEM } from '../actionTypes';
import { MenuActions, MenuActionTypes, MenuItemType } from '../../types/types';

export const openMenu = (content: MenuItemType): MenuActions => ({
    type: MenuActionTypes.OPEN_MENU_ITEM,
    payload: { ...content },
});

export const collapsiblePanelClick = (content: {
    item: MenuItemType;
    isOpened: boolean;
}): MenuActions => ({
    type: MenuActionTypes.OPEN_COLLAPSIBLE_ITEM,
    payload: { ...content },
});

export const setActiveTabName = (tabName: string): MenuActions => ({
    type: MenuActionTypes.SET_ACTIVE_TAB,
    payload: tabName,
});

export const closeMenu = (content: MenuItemType): MenuActions => ({
    type: MenuActionTypes.CLOSE_MENU_ITEM,
    payload: { ...content },
});

export const findItem = (content: any) => ({
    type: FIND_ITEM,
    payload: {
        id: 1,
        name: content,
    },
});
