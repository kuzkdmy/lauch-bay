import { AnyAction } from 'redux';
import createReducer from '../hooks/createReducer';
import { ConfigsActionTypes, ConfigType } from '../../types/types';

const initialState = {
    isLoading: false,
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
    [ConfigsActionTypes.FETCH_CONFIGS_ERROR]: (state: any) => {
        return { ...state, isLoading: false };
    },
};

export default createReducer(configsReducer, initialState);
