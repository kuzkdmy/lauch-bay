import { combineReducers } from 'redux';
import configsReducer from './configsReducer';
import tabsReducer from './tabsReducer';

export const rootReducer = combineReducers({
    tabState: tabsReducer,
    configsState: configsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
