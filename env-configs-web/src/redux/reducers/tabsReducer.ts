import { AnyAction } from 'redux';
import { ConfigType, TabsActionTypes } from '../../types/types';
import {
    envConfPanelId,
    getEmptyEnvConf,
    kubDeploymentsPanelId,
    replaceDeployConf,
} from '../../components/utils/configTabsUtils';
import createReducer from '../hooks/createReducer';

const initialState = {
    activeTabId: '',
    activeSubTabId: '',
    openedTabs: [],
    editTabs: {},
    collapsiblePanelState: {},
};

const tabsReducer = {
    [TabsActionTypes.ADD_NEW_ROW_TO_CONFIG]: (
        state: any,
        action: AnyAction
    ) => {
        const conf = state.editTabs[action.payload.id];
        const envConf = [...conf.envConf, { ...getEmptyEnvConf(null) }];

        return {
            ...state,
            editTabs: {
                ...state.editTabs,
                [action.payload.id]: {
                    ...conf,
                    envConf,
                },
            },
        };
    },
    [TabsActionTypes.EDIT_CONFIG_ROW]: (state: any, action: AnyAction) => {
        const configToEdit =
            state.editTabs[action.payload.config.id] || action.payload.config;
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
                [action.payload.config.id]: {
                    ...action.payload.config,
                    deployConf: replaceDeployConf(action.payload.deployConf, [
                        ...configToEdit.deployConf,
                    ]),
                },
            },
        };
    },
    [TabsActionTypes.OPEN_TAB]: (state: any, action: AnyAction) => {
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
    [TabsActionTypes.COLLAPSIBLE_ITEM_CLICK]: (
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
    [TabsActionTypes.CLOSE_TAB]: (state: any, action: AnyAction) => {
        const collapsiblePanelState = { ...state.collapsiblePanelState };

        if (action.payload.type === ConfigType.APPLICATION) {
            const kubId = kubDeploymentsPanelId(action.payload.id);
            const envConfId = envConfPanelId(action.payload.id);

            delete collapsiblePanelState[kubId];
            delete collapsiblePanelState[envConfId];
        }

        if (action.payload.id === 'projects-id') {
            Object.keys(collapsiblePanelState).forEach((key) => {
                if (
                    !(
                        key.includes('_Environment Configs') ||
                        key.includes('_Kubernetes Deployments')
                    )
                ) {
                    delete collapsiblePanelState[key];
                }
            });
        }

        return {
            ...state,
            collapsiblePanelState,
            openedTabs: state.openedTabs.filter((i: any) => {
                return i.id !== action.payload.id;
            }),
        };
    },
    [TabsActionTypes.SET_ACTIVE_TAB]: (state: any, action: AnyAction) => {
        return { ...state, activeTabId: action.payload };
    },
};

export default createReducer(tabsReducer, initialState);
