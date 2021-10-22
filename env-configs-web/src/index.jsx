import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import {Provider} from "react-redux";
import {createStore} from "redux";
import rootReducer from "./redux/reducers/rootReducer";
import {composeWithDevTools} from "redux-devtools-extension";
import App from "./components/App";

const store = createStore(rootReducer, composeWithDevTools());

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);
