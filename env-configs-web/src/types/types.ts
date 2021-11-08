export interface ConfigsState {
    isLoading: boolean;
    configs: {
        GLOBAL?: Configs[];
        PROJECT?: Configs[];
        MICROSERVICE?: Configs[];
    };
}

export interface MenuState {
    openedItems: any[]
}

export enum ConfigType {
    GLOBAL = 'GLOBAL', PROJECT = 'PROJECT', MICROSERVICE = 'MICROSERVICE'
}

export interface ConfigItem {
    value: any;
}

export interface Config {
    envKey: string;
    confType?: ConfigType;
    default?: ConfigItem;
    type: string;
    envOverride: {
        dev: ConfigItem | null;
        stage: ConfigItem | null;
        prod: ConfigItem | null;
    }
}

export interface Configs {
    id?: string;
    name: string;
    envConf: Config[];
    deployConf: Config[];
    confType: ConfigType;
    version: number;
}

export interface MenuItem {
    name: string;
    topLevel: boolean;
    isOpened: boolean;
    type: ConfigType;
    nestedItems?: MenuItem[];
    topLevelItem?: any;
    rows?: any[];
}

export enum ConfigsActionTypes {
    FETCH_CONFIGS = 'FETCH_CONFIGS',
    FETCH_CONFIGS_SUCCESS = 'FETCH_CONFIGS_SUCCESS',
    FETCH_CONFIGS_ERROR = 'FETCH_CONFIGS_ERROR',
    REFRESH_GLOBAL_CONFIGS_SUCCESS = 'REFRESH_GLOBAL_CONFIGS_SUCCESS',
    REFRESH_PROJECTS_CONFIGS_SUCCESS = 'REFRESH_PROJECTS_CONFIGS_SUCCESS',
    REFRESH_PROJECT_CONFIGS_SUCCESS = 'REFRESH_PROJECT_CONFIGS_SUCCESS',
    REFRESH_CONFIGS = 'REFRESH_CONFIGS',
    FIND_ITEMS = 'FIND_ITEMS'
}

interface FetchConfigsAction {
    type: ConfigsActionTypes.FETCH_CONFIGS;
}

interface FetchConfigsErrorAction {
    type: ConfigsActionTypes.FETCH_CONFIGS_ERROR;
    payload?: any;
}

interface FetchConfigsSuccessAction {
    type: ConfigsActionTypes.FETCH_CONFIGS_SUCCESS;
    payload: {
        confType: ConfigType
        configs: Configs
    };
}

interface RefreshProjectConfigsAction {
    type: ConfigsActionTypes.REFRESH_CONFIGS;
    payload: {
        id: string
    };
}

interface RefreshGlobalConfigsSuccessAction {
    type: ConfigsActionTypes.REFRESH_GLOBAL_CONFIGS_SUCCESS;
    payload: {
        id: string;
        confType: ConfigType;
        configs: Configs;
    };
}

interface RefreshProjectsConfigsSuccessAction {
    type: ConfigsActionTypes.REFRESH_PROJECTS_CONFIGS_SUCCESS;
    payload: {
        id: string;
        confType: ConfigType;
        configs: Configs[];
    };
}

interface RefreshProjectConfigsSuccessAction {
    type: ConfigsActionTypes.REFRESH_PROJECT_CONFIGS_SUCCESS;
    payload: {
        id: string;
        confType: ConfigType;
        configs: Configs;
    };
}

interface FindMenuAction {
    type: ConfigsActionTypes.FIND_ITEMS;
    payload: any;
}


export enum MenuActionTypes {
    OPEN_MENU_ITEM = 'OPEN_MENU_ITEM',
    CLOSE_MENU_ITEM = 'CLOSE_MENU_ITEM'
}

export interface MenuItemType {
    id?: string;
    name: string;
    type: ConfigType;
    isTableContent?: boolean;
    parentConfigType?: ConfigType;
}

export interface MenuActions {
    type: MenuActionTypes;
    payload?: MenuItemType
}

export type ConfigsActions =
    FetchConfigsAction | FetchConfigsSuccessAction | FetchConfigsErrorAction | FindMenuAction | MenuActions |
    RefreshProjectConfigsAction | RefreshProjectConfigsSuccessAction | RefreshProjectsConfigsSuccessAction |
    RefreshGlobalConfigsSuccessAction
