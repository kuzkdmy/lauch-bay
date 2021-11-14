import { AnyAction } from 'redux';
import createReducer from '../hooks/createReducer';
import { ConfigsActionTypes, ConfigType } from '../../types/types';
import _ from 'lodash';

const initialState = {
    isLoading: false,
    hasErrors: false,
    configs: {},
};

const configsReducer = {
    [ConfigsActionTypes.FETCH_CONFIGS]: (state: any) => {
        return { ...state, isLoading: true };
    },
    [ConfigsActionTypes.FETCH_CONFIGS_SUCCESS]: (
        state: any,
        action: AnyAction
    ) => {
        if (action.payload.confType === ConfigType.GLOBAL) {
            return {
                ...state,
                isLoading: false,
                configs: {
                    ...state.configs,
                    'global-id': {
                        ...action.payload.configs,
                        id: 'global-id',
                    },
                },
            };
        }
        if (
            action.payload.confType === ConfigType.PROJECT &&
            Array.isArray(action.payload.configs)
        ) {
            return {
                ...state,
                isLoading: false,
                configs: {
                    ...state.configs,
                    'projects-id': action.payload.configs,
                },
            };
        } else if (action.payload.confType === ConfigType.PROJECT) {
            const projectConfigs = [...state.configs['projects-id']];
            const projectConfigIndex = _.findIndex(projectConfigs, {
                id: action.payload.id,
            });
            projectConfigs.splice(projectConfigIndex, 1, action.payload);

            console.log(action.payload, '0');

            return {
                ...state,
                isLoading: false,
                configs: {
                    ...state.configs,
                    'projects-id': projectConfigs,
                },
            };
        }
        console.log(action.payload, '1');
        return {
            ...state,
            isLoading: false,
            configs: {
                ...state.configs,
                [action.payload.id]: action.payload.configs,
            },
        };
    },
    [ConfigsActionTypes.CONFIG_UPDATE_SUCCESS]: (
        state: any,
        action: AnyAction
    ) => {
        return {
            ...state,
            configs: {
                ...state.configs,
                [action.payload.id]: action.payload.config,
            },
        };
    },
    [ConfigsActionTypes.REMOVE_CONFIG_FROM_STATE]: (
        state: any,
        action: AnyAction
    ) => {
        const stateConfigs = { ...state };
        delete stateConfigs.configs[action.payload.id];

        return { ...stateConfigs };
    },
    [ConfigsActionTypes.CONFIG_REQUESTS_ERROR]: (state: any) => {
        return { ...state, isLoading: false, hasErrors: true };
    },
    [ConfigsActionTypes.SET_HAS_ERRORS]: (state: any, action: AnyAction) => {
        return { ...state, hasErrors: action.payload.isError };
    },
};

export default createReducer(configsReducer, initialState);
