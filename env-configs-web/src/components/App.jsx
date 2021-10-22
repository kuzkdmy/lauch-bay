import './App.scss';
import {debounce, TextField} from "@mui/material";
import TabsPanel from "./tabsPanel/TabsPanel";
import SideBar from "./sideBar/SideBar";
import {connect} from "react-redux";
import {findItem} from "../redux/actions";

const App = () => {

    return (
            <div className="App">
                <div className='main-content'>
                    <div className='side-bar'>
                        <TextField
                            sx={{width: 300, height: 29}}
                            id="outlined-basic"
                            label="search by menu"
                            variant="outlined"
                        />
                        <div className='side-bar-menu'>
                            <SideBar />
                        </div>
                    </div>
                    <div className='content'>
                        <TabsPanel />
                    </div>
                </div>
            </div>
    );
}

export default connect(null, {findItem})(App);
