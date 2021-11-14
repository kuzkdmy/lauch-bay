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
    default: ConfigItem | null;
    type: string | null;
    envOverride: {
        dev: ConfigItem | null;
        stage: ConfigItem | null;
        prod: ConfigItem | null;
    };
}

export interface Configs {
    id: string;
    projectId?: string;
    name: string;
    envConf: Config[];
    deployConf: Config[] | null;
    confType: ConfigType;
    version: number;
}

export enum ConfigsActionTypes {
    FETCH_CONFIGS = 'FETCH_CONFIGS',
    FETCH_CONFIGS_SUCCESS = 'FETCH_CONFIGS_SUCCESS',
    SET_HAS_ERRORS = 'SET_HAS_ERRORS',

    CONFIG_REQUESTS_ERROR = 'CONFIG_REQUESTS_ERROR',
    REMOVE_CONFIG_FROM_STATE = 'REMOVE_CONFIG_FROM_STATE',
    REFRESH_CONFIGS = 'REFRESH_CONFIGS',

    CONFIG_UPDATE_SUCCESS = 'CONFIG_UPDATE_SUCCESS',
    CREATE_NEW_CONFIG = 'CREATE_NEW_CONFIG',
    CREATE_NEW_SUCCESS = 'CREATE_NEW_SUCCESS',
}

export enum MenuActionTypes {
    OPEN_TAB = 'OPEN_TAB',
    OPEN_CREATE_NEW_CONFIG = 'OPEN_CREATE_NEW_CONFIG',
    COLLAPSIBLE_ITEM_CLICK = 'COLLAPSIBLE_ITEM_CLICK',

    CLOSE_TAB = 'CLOSE_TAB',

    ADD_NEW_ROW_TO_CONFIG = 'ADD_NEW_ROW_TO_CONFIG',
    EDIT_CONFIG_ROW = 'EDIT_CONFIG_ROW',

    SET_ACTIVE_TAB = 'SET_ACTIVE_TAB',
}

export interface MenuItemType {
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

export interface MenuActions {
    type: MenuActionTypes;
    payload: any;
}

interface FetchConfigsAction {
    type: ConfigsActionTypes.FETCH_CONFIGS;
}
interface CreateNewConfig {
    type: ConfigsActionTypes.CREATE_NEW_CONFIG;
}
interface CreatedNewConfig {
    type: ConfigsActionTypes.CREATE_NEW_SUCCESS;
    payload: any;
}
interface ConfigUpdateSuccess {
    type: ConfigsActionTypes.CONFIG_UPDATE_SUCCESS;
    payload: any;
}
interface ConfigRequestsErrorAction {
    type: ConfigsActionTypes.CONFIG_REQUESTS_ERROR;
    payload?: any;
}
interface FetchConfigsSuccessAction {
    type: ConfigsActionTypes.FETCH_CONFIGS_SUCCESS;
    payload: any;
}
interface RemoveConfigFromState {
    type: ConfigsActionTypes.REMOVE_CONFIG_FROM_STATE;
    payload: {
        id: string;
    };
}
interface RefreshProjectConfigsAction {
    type: ConfigsActionTypes.REFRESH_CONFIGS;
    payload: {
        id: string;
        config: Configs;
    };
}
interface SetIsErrorAction {
    type: ConfigsActionTypes.SET_HAS_ERRORS;
    payload: {
        isError: boolean;
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
    | MenuActions
    | RefreshProjectConfigsAction;
