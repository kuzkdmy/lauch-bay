import React, { useEffect } from 'react';
import './App.scss';
import MenuBar from './menuBar/MenuBar';
import ConfigTabs from './configTabs/ConfigTabs';
import NotificationAlert from './notificationAlert/NotificationAlert';
import { useActions } from '../redux/hooks/useActions';
import { useTypedSelector } from '../redux/hooks/useTypedSelector';
import _ from 'lodash';

const App = () => {
    const { setHasErrors, removeConfigFromState } = useActions();
    const { hasErrors } = useTypedSelector((state) => state.configsState);
    const tabState = useTypedSelector((state) => state.tabState);

    useEffect(() => {
        if (_.isEmpty(tabState.openedTabs)) {
            removeConfigFromState();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tabState]);

    return (
        <div className="App">
            <div className="main-content">
                <div className="side-bar side-bar-menu">
                    <MenuBar />
                </div>
                <div className="content">
                    <NotificationAlert />

                    <ConfigTabs />
                </div>
            </div>
        </div>
    );
};

export default App;
