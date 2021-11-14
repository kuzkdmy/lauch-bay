import { AnyAction } from 'redux';
import createReducer from '../hooks/createReducer';
import { ConfigsActionTypes, ConfigType } from '../../types/types';
import _ from 'lodash';

const initialState = {
    isLoading: false,
    hasErrors: false,
    configs: {
        [ConfigType.GLOBAL]: {},
        [ConfigType.PROJECT]: {},
        [ConfigType.APPLICATION]: {},
    },
};

const configsReducer = {
    [ConfigsActionTypes.FETCH_CONFIGS]: (state: any) => {
        return { ...state, isLoading: true };
    },
    [ConfigsActionTypes.FETCH_CONFIGS_SUCCESS]: (
        state: any,
        action: AnyAction
    ) => {
        return {
            ...state,
            configs: {
                ...state.configs,
                [action.payload.confType]: {
                    ...state.configs[action.payload.confType],
                    [action.payload.id]: action.payload.configs,
                },
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
                [action.payload.config.confType]: {
                    [action.payload.config.id]: action.payload.config,
                },
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
    [ConfigsActionTypes.CONFIG_REQUEST_ERROR]: (state: any) => {
        return { ...state, isLoading: false, hasErrors: true };
    },
    [ConfigsActionTypes.SET_HAS_ERRORS]: (state: any, action: AnyAction) => {
        return { ...state, hasErrors: action.payload.isError };
    },
};

export default createReducer(configsReducer, initialState);
