import React from 'react';
import {connect} from "react-redux";
import './App.scss';
import {findItem} from "../redux/actions/menuActions";
import MenuBar from "./menuBar/MenuBar";
import ConfigTabs from "./configTabs/ConfigTabs";

const App = () => {

    return (
        <div className="App">
            <div className='main-content'>
                <div className='side-bar'>
                    <div className='side-bar-menu'>
                        <MenuBar />
                    </div>
                </div>
                <div className='content'>
                    <ConfigTabs />
                </div>
            </div>
        </div>
    );
}

export default App;
