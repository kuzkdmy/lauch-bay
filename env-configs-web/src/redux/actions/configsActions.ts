import { Dispatch } from 'redux';
import axios from 'axios';
import {
    Configs,
    ConfigsActions,
    ConfigsActionTypes,
    ConfigType,
    MenuActionTypes,
} from '../../types/types';

export const fetchGlobalConfigs = () => {
    return async (dispatch: Dispatch<ConfigsActions>) => {
        try {
            dispatch({ type: ConfigsActionTypes.FETCH_CONFIGS });
            const response = await axios.get<Configs>(
                '/api/v1.0/global_config'
            );

            if (!response.data.envConf.length) {
                dispatch({
                    type: ConfigsActionTypes.FETCH_CONFIGS_ERROR,
                });
            } else {
                dispatch({
                    type: ConfigsActionTypes.FETCH_CONFIGS_SUCCESS,
                    payload: {
                        configs: response.data,
                        confType: ConfigType.GLOBAL,
                    },
                });
            }
        } catch (e) {
            dispatch({
                type: ConfigsActionTypes.FETCH_CONFIGS_ERROR,
                payload: '',
            });
        }
    };
};

export const fetchProjectConfigs = () => {
    return async (dispatch: Dispatch<ConfigsActions>) => {
        try {
            dispatch({ type: ConfigsActionTypes.FETCH_CONFIGS });
            const response = await axios.get<Configs>('/api/v1.0/project');

            if (!response.data) {
                dispatch({
                    type: ConfigsActionTypes.FETCH_CONFIGS_ERROR,
                });
            } else {
                dispatch({
                    type: ConfigsActionTypes.FETCH_CONFIGS_SUCCESS,
                    payload: {
                        configs: response.data,
                        confType: ConfigType.PROJECT,
                    },
                });
            }
            dispatch({
                type: MenuActionTypes.OPEN_MENU_ITEM,
                payload: {
                    name: 'Projects',
                    isTableContent: false,
                    type: ConfigType.PROJECT,
                    parentConfigType: ConfigType.GLOBAL,
                },
            });
        } catch (e) {
            console.log(e);
            dispatch({
                type: ConfigsActionTypes.FETCH_CONFIGS_ERROR,
                payload: '',
            });
        }
    };
};

const getConfigsUrl = (type: ConfigType, id: string) => {
    switch (type) {
        case ConfigType.GLOBAL:
            return `/api/v1.0/global_config`;
        case ConfigType.PROJECT:
            return `/api/v1.0/project${id ? `/${id}` : ''}`;
        case ConfigType.MICROSERVICE:
            return '';
    }
};

const getRefreshConfigPayload = (type: ConfigType, data: any) => {
    switch (true) {
        case ConfigType.GLOBAL === type:
            return {
                type: ConfigsActionTypes.REFRESH_GLOBAL_CONFIGS_SUCCESS,
            };
        case ConfigType.PROJECT && Array.isArray(data):
            return {
                type: ConfigsActionTypes.REFRESH_PROJECTS_CONFIGS_SUCCESS,
            };
        case ConfigType.PROJECT === type:
            return {
                type: ConfigsActionTypes.REFRESH_PROJECT_CONFIGS_SUCCESS,
            };
    }
};

export const refreshConfigs = (type: ConfigType, id: string) => {
    return async (dispatch: Dispatch<ConfigsActions>) => {
        try {
            dispatch({
                type: ConfigsActionTypes.REFRESH_CONFIGS,
                payload: { id },
            });
            const response = await axios.get<Configs>(getConfigsUrl(type, id));

            if (!response.data) {
                dispatch({
                    type: ConfigsActionTypes.FETCH_CONFIGS_ERROR,
                });
            } else {
                dispatch({
                    ...getRefreshConfigPayload(type, response.data),
                    payload: { configs: response.data, confType: type, id },
                } as any);
            }
        } catch (e) {
            console.log(e);
            dispatch({
                type: ConfigsActionTypes.FETCH_CONFIGS_ERROR,
                payload: '',
            });
        }
    };
};

export const fetchApplicationConfigs = (projectId: string) => {
    return async (dispatch: Dispatch<ConfigsActions>) => {
        try {
            dispatch({
                type: ConfigsActionTypes.FETCH_CONFIGS,
                payload: { id: projectId },
            });
            const response = await axios.get<Configs>(
                `/api/v1.0/application/?project_id=${projectId}`
            );

            if (!response.data) {
                dispatch({
                    type: ConfigsActionTypes.FETCH_CONFIGS_ERROR,
                });
            } else {
                dispatch({
                    type: ConfigsActionTypes.FETCH_APPLICATION_CONFIGS_SUCCESS,
                    payload: {
                        configs: response.data,
                        confType: ConfigType.MICROSERVICE,
                        projectId,
                    },
                } as any);
            }
        } catch (e) {
            console.log(e);
            dispatch({
                type: ConfigsActionTypes.FETCH_CONFIGS_ERROR,
                payload: '',
            });
        }
    };
};
