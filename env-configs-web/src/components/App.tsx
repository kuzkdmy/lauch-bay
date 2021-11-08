import React from 'react';
import './App.scss';
import MenuBar from './menuBar/MenuBar';
import ConfigTabs from './configTabs/ConfigTabs';

const App = () => {
    return (
        <div className="App">
            <div className="main-content">
                <div className="side-bar">
                    <div className="side-bar-menu">
                        <MenuBar />
                    </div>
                </div>
                <div className="content">
                    <ConfigTabs />
                </div>
            </div>
        </div>
    );
};

export default App;
