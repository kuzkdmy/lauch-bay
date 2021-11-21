import { AnyAction } from 'redux';
import createReducer from '../hooks/createReducer';
import { ConfigsActionTypes, ConfigType } from '../../types/types';
import _ from 'lodash';
import { addEmptyDeployments } from '../../components/configTabs/utils/configTabsUtils';

const initialState = {
    isLoading: false,
    hasErrors: false,
    successfullyCreated: false,
    successfullyUpdated: false,
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
            resultConfigs = {
                [action.payload.id]: {
                    ...action.payload.configs,
                    deployConf: addEmptyDeployments(
                        action.payload.configs.deployConf
                    ),
                },
            };
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
    [ConfigsActionTypes.CREATE_NEW_CONFIG_SUCCESS]: (
        state: any,
        action: AnyAction
    ) => {
        return {
            ...state,
            successfullyCreated: true,
        };
    },
    [ConfigsActionTypes.CONFIG_UPDATE_SUCCESS]: (
        state: any,
        action: AnyAction
    ) => {
        return {
            ...state,
            successfullyUpdated: true,
            configs: {
                ...state.configs,
                [action.payload.config.confType]: {
                    ...state.configs[action.payload.config.confType],
                    [action.payload.id]: {
                        ...action.payload.config,
                        deployConf: addEmptyDeployments(
                            action.payload.config.deployConf
                        ),
                    },
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
        return {
            ...state,
            successfullyCreated: false,
            successfullyUpdated: false,
            hasErrors: action.payload.isError,
        };
    },
};

export default createReducer(configsReducer, initialState);
