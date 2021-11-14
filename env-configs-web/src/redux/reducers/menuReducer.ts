import { AnyAction } from 'redux';
import { MenuActionTypes } from '../../types/types';
import { getEmptyEnvConf } from '../../components/configTabs/utils/configTabsUtils';
import createReducer from '../hooks/createReducer';

const initialState = {
    activeTabId: '',
    openedTabs: [],
    editTabs: {},
    collapsiblePanelState: {},
};

const menuReducer = {
    [MenuActionTypes.ADD_NEW_ROW_TO_CONFIG]: (
        state: any,
        action: AnyAction
    ) => {
        const conf = state.editTabs[action.payload.id];
        const envConf = [...conf.envConf, { ...getEmptyEnvConf() }];

        return {
            ...state,
            editTabs: {
                ...state.editTabs,
                [action.payload.id]: {
                    ...conf,
                    envConf: envConf,
                },
            },
        };
    },
    [MenuActionTypes.EDIT_CONFIG_ROW]: (state: any, action: AnyAction) => {
        if (!action.payload.isEdit) {
            const stateEditTabs = { ...state.editTabs };
            delete stateEditTabs[action.payload.config.id];
            return {
                ...state,
                editTabs: stateEditTabs,
            };
        }
        return {
            ...state,
            editTabs: {
                ...state.editTabs,
                [action.payload.config.id]: action.payload.config,
            },
        };
    },
    [MenuActionTypes.OPEN_TAB]: (state: any, action: AnyAction) => {
        if (
            !state.openedTabs
                .map((item: any) => item.id)
                .includes(action.payload?.id)
        ) {
            return {
                ...state,
                activeTabId: action.payload.id,
                openedTabs: [...state.openedTabs, action.payload],
            };
        }
        return { ...state, activeTabId: action.payload.id };
    },
    [MenuActionTypes.COLLAPSIBLE_ITEM_CLICK]: (
        state: any,
        action: AnyAction
    ) => {
        return {
            ...state,
            collapsiblePanelState: {
                ...state.collapsiblePanelState,
                [action.payload.item.id]: action.payload.isOpen,
            },
        };
    },
    [MenuActionTypes.CLOSE_TAB]: (state: any, action: AnyAction) => {
        return {
            ...state,
            collapsiblePanelState:
                action.payload.id === 'projects-id'
                    ? []
                    : state.collapsiblePanelState,
            openedTabs: state.openedTabs.filter((i: any) => {
                return i.id !== action.payload.id;
            }),
        };
    },
    [MenuActionTypes.SET_ACTIVE_TAB]: (state: any, action: AnyAction) => {
        return { ...state, activeTabId: action.payload };
    },
};

export default createReducer(menuReducer, initialState);
