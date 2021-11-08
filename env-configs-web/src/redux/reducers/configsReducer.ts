import {
    Configs,
    ConfigsActions,
    ConfigsActionTypes,
    ConfigsState,
} from '../../types/types';
import _ from 'lodash';

const initialState = {
    isLoading: false,
    configs: {},
};

// const findMenuItem = (name, item, state) => {
//     if (!name) {
//         return initialState.items;
//     }
//     if (item.name.includes(name)) {
//         return {...item, isOpened: true};
//     }
//     if (!item.nestedItems) {
//         return item;
//     }
//
//     const nestedItems = item.nestedItems.map(i => findMenuItem(name, i, state));
//
//     return {
//         ...item,
//         isOpened: nestedItems.map(i => i.isOpened).reduce((i1, i2) => i1 || i2),
//         nestedItems: nestedItems
//     };
// }

const configsReducer = (
    state = initialState as ConfigsState,
    action: ConfigsActions
): ConfigsState => {
    switch (action.type) {
        case ConfigsActionTypes.FETCH_CONFIGS:
            return { ...state, isLoading: true };
        case ConfigsActionTypes.FETCH_CONFIGS_SUCCESS:
            return {
                ...state,
                isLoading: false,
                configs: {
                    ...state.configs,
                    [action.payload.confType]: action.payload.configs,
                },
            };
        case ConfigsActionTypes.REFRESH_GLOBAL_CONFIGS_SUCCESS:
            return {
                ...state,
                isLoading: false,
                configs: {
                    ...state.configs,
                    [action.payload.confType]: action.payload.configs,
                },
            };
        case ConfigsActionTypes.REFRESH_PROJECT_CONFIGS_SUCCESS:
            const refreshedConfigs = [
                ...(state.configs[action.payload.confType] as Configs[]),
            ];
            const idx = _.findIndex(refreshedConfigs, {
                id: action.payload.id,
            });
            refreshedConfigs.splice(idx, 1, action.payload.configs);

            return {
                ...state,
                isLoading: false,
                configs: {
                    ...state.configs,
                    [action.payload.confType]: refreshedConfigs,
                },
            };
        case ConfigsActionTypes.REFRESH_PROJECTS_CONFIGS_SUCCESS:
            return {
                ...state,
                isLoading: false,
                configs: {
                    ...state.configs,
                    [action.payload.confType]: action.payload.configs,
                },
            };
        case ConfigsActionTypes.FETCH_CONFIGS_ERROR:
            return { ...state, isLoading: false };
        default: {
            return state;
        }
    }
};

export default configsReducer;
