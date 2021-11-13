import { Dispatch } from 'redux';
import axios from 'axios';
import {
    Configs,
    ConfigsActions,
    ConfigsActionTypes,
    ConfigType,
    MenuActionTypes,
} from '../../types/types';

interface FetchConfigProps {
    type: ConfigType;
    id: string;
    name: string;
    projectId?: string;
    isTableContent?: boolean;
    openAfterFetching?: boolean;
}

export const fetchConfigs = ({
    type,
    id,
    name,
    projectId,
    isTableContent,
    openAfterFetching,
}: FetchConfigProps) => {
    return async (dispatch: Dispatch<ConfigsActions>) => {
        try {
            const response = await axios.get<Configs>(
                getConfigsUrl()[type](id, projectId)
            );
            dispatch({
                type: ConfigsActionTypes.FETCH_CONFIGS_SUCCESS,
                payload: {
                    id,
                    configs: response.data,
                    confType: type,
                },
            });
            openAfterFetching &&
                dispatch({
                    type: MenuActionTypes.OPEN_TAB,
                    payload: {
                        id,
                        name: name,
                        isTableContent,
                        type: type,
                    },
                });
        } catch (e) {
            console.log(e);
            dispatch({
                type: ConfigsActionTypes.FETCH_CONFIGS_ERROR,
            });
        }
    };
};

export const removeConfigFromState = (id: string): ConfigsActions => ({
    type: ConfigsActionTypes.REMOVE_CONFIG_FROM_STATE,
    payload: { id },
});

export const createConfigs = (config: Configs) => {
    return async (dispatch: Dispatch<ConfigsActions>) => {
        try {
            const post = await axios.post(
                getConfigsUrl()[config.confType](),
                config
            );
            if (post.status === 200) {
                dispatch({
                    type: ConfigsActionTypes.CREATE_NEW_SUCCESS,
                    payload: { name: config.name, type: config.confType },
                });
                dispatch({
                    type: ConfigsActionTypes.FETCH_CONFIGS_SUCCESS,
                    payload: {
                        id: config.id,
                        configs: post.data,
                        confType: config.confType,
                    },
                });
                dispatch({
                    type: MenuActionTypes.OPEN_TAB,
                    payload: {
                        id: config.id,
                        name: config.name,
                        isTableContent: true,
                        type: config.confType,
                    },
                });
            }
        } catch (e) {
            dispatch({
                type: ConfigsActionTypes.CREATE_NEW_CONFIG_ERROR,
            });
        }
    };
};

export const updateConfig = (config: Configs) => {
    return async (dispatch: Dispatch<ConfigsActions>) => {
        try {
            await updateConfigRequest(config)[config.confType]();
            dispatch({
                type: MenuActionTypes.EDIT_CONFIG_ROW,
                payload: { config },
            });
            dispatch({
                type: ConfigsActionTypes.CONFIG_UPDATE_SUCCESS,
                payload: { id: config.id, config },
            });
        } catch (e) {
            dispatch({
                type: ConfigsActionTypes.CONFIG_UPDATE_SUCCESS,
                payload: config.id,
            });
        }
    };
};

const updateConfigRequest = (body: any) => ({
    [ConfigType.GLOBAL]: () => {
        return axios.put('/api/v1.0/global_config', body);
    },
    [ConfigType.PROJECT]: () => {
        return axios.post('/api/v1.0/project', body);
    },
    [ConfigType.APPLICATION]: () => {
        return axios.put('/api/v1.0/application', body);
    },
});

const getConfigsUrl = () => ({
    [ConfigType.GLOBAL]: () => `/api/v1.0/global_config`,
    [ConfigType.PROJECT]: (id?: string) => {
        if (id === 'projects-id') return '/api/v1.0/project';
        return `/api/v1.0/project${id ? `/${id}` : ''}`;
    },
    [ConfigType.APPLICATION]: (id?: string, projectId?: string) => {
        if (projectId) return `/api/v1.0/application?project_id=${projectId}`;
        return `/api/v1.0/application${id ? `/${id}` : ''}`;
    },
});
