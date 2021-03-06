export enum ConfigType {
    GLOBAL = 'GLOBAL',
    PROJECT = 'PROJECT',
    APPLICATION = 'APPLICATION',
}

export interface ConfigItem {
    value: any;
}

export interface Config {
    envKey: string | null;
    confType?: ConfigType;
    isDisabled?: boolean;
    default: any;
    type: string | null;
    envOverride: {
        dev: any;
        stage: any;
        prod: any;
    };
}

export interface Configs {
    id: string;
    projectId?: string;
    name: string;
    envConf: Config[];
    deployConf: Config[];
    confType: ConfigType;
    version: number;
}

export enum ConfigsActionTypes {
    FETCH_CONFIGS = 'FETCH_CONFIGS',
    FETCH_CONFIGS_SUCCESS = 'FETCH_CONFIGS_SUCCESS',
    SET_HAS_ERRORS = 'SET_HAS_ERRORS',

    CONFIG_REQUEST_ERROR = 'CONFIG_REQUEST_ERROR',
    REMOVE_CONFIG_FROM_STATE = 'REMOVE_CONFIG_FROM_STATE',
    REFRESH_CONFIGS = 'REFRESH_CONFIGS',

    CONFIG_UPDATE_SUCCESS = 'CONFIG_UPDATE_SUCCESS',
    CREATE_NEW_CONFIG = 'CREATE_NEW_CONFIG',
    CREATE_NEW_CONFIG_SUCCESS = 'CREATE_NEW_CONFIG_SUCCESS',
}

export enum TabsActionTypes {
    OPEN_TAB = 'OPEN_TAB',
    OPEN_CREATE_NEW_CONFIG = 'OPEN_CREATE_NEW_CONFIG',
    COLLAPSIBLE_ITEM_CLICK = 'COLLAPSIBLE_ITEM_CLICK',

    CLOSE_TAB = 'CLOSE_TAB',

    ADD_NEW_ROW_TO_CONFIG = 'ADD_NEW_ROW_TO_CONFIG',
    EDIT_CONFIG_ROW = 'EDIT_CONFIG_ROW',
    EDIT_DEPLOYMENTS_CONFIG_ROW = 'EDIT_DEPLOYMENTS_CONFIG_ROW',

    SET_ACTIVE_TAB = 'SET_ACTIVE_TAB',
    SET_ACTIVE_SUB_TAB = 'SET_ACTIVE_SUB_TAB',
}

export interface TabItemType {
    id: string;
    projectId?: string;
    name: string;
    type: ConfigType;
    isTableContent?: boolean;
    hasGlobalConfigType?: boolean;
    hasProjectConfigType?: boolean;
}

export interface TabContent {
    tabName: string;
    content: any;
}

export interface TabsActions {
    type: TabsActionTypes;
    payload: any;
}

interface FetchConfigsAction {
    type: ConfigsActionTypes.FETCH_CONFIGS;
}
interface CreateNewConfig {
    type: ConfigsActionTypes.CREATE_NEW_CONFIG;
}
interface CreatedNewConfig {
    type: ConfigsActionTypes.CREATE_NEW_CONFIG_SUCCESS;
    payload: any;
}
interface ConfigUpdateSuccess {
    type: ConfigsActionTypes.CONFIG_UPDATE_SUCCESS;
    payload: any;
}
interface ConfigRequestsErrorAction {
    type: ConfigsActionTypes.CONFIG_REQUEST_ERROR;
    payload?: any;
}
interface FetchConfigsSuccessAction {
    type: ConfigsActionTypes.FETCH_CONFIGS_SUCCESS;
    payload: any;
}
interface RemoveConfigFromState {
    type: ConfigsActionTypes.REMOVE_CONFIG_FROM_STATE;
}
interface RefreshProjectConfigsAction {
    type: ConfigsActionTypes.REFRESH_CONFIGS;
    payload: {
        id: string;
        config: Configs;
    };
}

export type ConfigsActions =
    | CreateNewConfig
    | RemoveConfigFromState
    | CreatedNewConfig
    | ConfigUpdateSuccess
    | FetchConfigsAction
    | FetchConfigsSuccessAction
    | ConfigRequestsErrorAction
    | TabsActions
    | RefreshProjectConfigsAction;
