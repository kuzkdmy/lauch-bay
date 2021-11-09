import { MenuActions, MenuActionTypes, MenuState } from '../../types/types';

const initialState = {
    activeTabName: '',
    openedItems: [] as any[],
    collapsedItems: {},
};

const menuReducer = (state = initialState, action: MenuActions): MenuState => {
    switch (action.type) {
        case MenuActionTypes.OPEN_MENU_ITEM:
            if (
                !state.openedItems
                    .map((item) => item.name)
                    .includes(action.payload?.name)
            ) {
                return {
                    ...state,
                    activeTabName: action.payload.name,
                    openedItems: [...state.openedItems, action.payload],
                };
            }
            return { ...state, activeTabName: action.payload.name };
        case MenuActionTypes.OPEN_COLLAPSIBLE_ITEM:
            return {
                ...state,
                collapsedItems: {
                    ...state.collapsedItems,
                    [action.payload.item.name]: action.payload.isOpened,
                },
            };
        case MenuActionTypes.CLOSE_MENU_ITEM:
            return {
                ...state,
                openedItems: state.openedItems.filter((i: any) => {
                    return i.name !== action.payload?.name;
                }),
            };
        case MenuActionTypes.SET_ACTIVE_TAB:
            return { ...state, activeTabName: action.payload };
        default: {
            return state;
        }
    }
};

export default menuReducer;
