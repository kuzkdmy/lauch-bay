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
        let resultConfigs;
        if (Array.isArray(action.payload.configs)) {
            resultConfigs = action.payload.configs.reduce(function (
                acc,
                curVal
            ) {
                return {
                    ...acc,
                    ...{ [curVal.id]: curVal },
                };
            },
            {});
        } else {
            resultConfigs = { [action.payload.id]: action.payload.configs };
        }

        return {
            ...state,
            configs: {
                ...state.configs,
                [action.payload.confType]: {
                    ...state.configs[action.payload.confType],
                    ...resultConfigs,
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
    [ConfigsActionTypes.REMOVE_CONFIG_FROM_STATE]: (state: any) => {
        return {
            ...state,
            configs: {
                ...state.configs,
                [ConfigType.PROJECT]: {},
                [ConfigType.APPLICATION]: {},
            },
        };
    },
    [ConfigsActionTypes.CONFIG_REQUEST_ERROR]: (state: any) => {
        return { ...state, isLoading: false, hasErrors: true };
    },
    [ConfigsActionTypes.SET_HAS_ERRORS]: (state: any, action: AnyAction) => {
        return { ...state, hasErrors: action.payload.isError };
    },
};

export default createReducer(configsReducer, initialState);
