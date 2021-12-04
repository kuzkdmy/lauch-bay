// @ts-ignore
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { rootReducer } from '../../redux/reducers/rootReducer';
import thunk from 'redux-thunk';

describe('renders correctly', () => {
    const store = createStore(rootReducer, applyMiddleware(thunk));
    store.dispatch = jest.fn();

    it('render env configs menu', () => {
        render(
            <Provider store={store}>
                <App />
            </Provider>
        );
        const envConfigs = screen.getByText(/Environment Configs/);
        expect(envConfigs).toBeInTheDocument();
    });

    it('render main content', () => {
        render(
            <Provider store={store}>
                <App />
            </Provider>
        );
        const mainContent = screen.getByText(
            /There are no selected configs, choose one or create new/
        );
        expect(mainContent).toBeInTheDocument();
    });
});
