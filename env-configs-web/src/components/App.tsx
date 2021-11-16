import React from 'react';
import './App.scss';
import MenuBar from './menuBar/MenuBar';
import ConfigTabs from './configTabs/ConfigTabs';
import { Alert } from '@mui/material';
import NotificationComponent from './alert/NotificationComponent';
import { useActions } from '../redux/hooks/useActions';
import { useTypedSelector } from '../redux/hooks/useTypedSelector';

const App = () => {
    const { setHasErrors } = useActions();
    const { hasErrors } = useTypedSelector((state) => state.configsState);

    return (
        <div className="App">
            <div className="main-content">
                <div className="side-bar">
                    <div className="side-bar-menu">
                        <MenuBar />
                    </div>
                </div>
                <div className="content">
                    <NotificationComponent
                        alertSeverity={'error'}
                        visibilityState={{
                            setVisible: setHasErrors,
                            isVisible: hasErrors,
                        }}
                        message="Something went wrong !"
                    />

                    <ConfigTabs />
                </div>
            </div>
        </div>
    );
};

export default App;
