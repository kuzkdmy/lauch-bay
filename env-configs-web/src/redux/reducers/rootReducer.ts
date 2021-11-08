import { combineReducers } from 'redux';
import configsReducer from './configsReducer';
import menuReducer from './menuReducer';

export const rootReducer = combineReducers({
    menu: menuReducer,
    configsState: configsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
