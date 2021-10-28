import './App.scss';
import {TextField} from "@mui/material";
import TabsPanel from "./tabsPanel/TabsPanel";
import SideBar from "./sideBar/SideBar";
import {connect} from "react-redux";
import {findItem} from "../redux/actions";

const App = (props) => {

    const onSearch = (event) => {
        if(event.key === 'Enter') {
            props.findItem(event.target.value);
        }
    }

    return (
            <div className="App">
                <div className='main-content'>
                    <div className='side-bar'>
                        <TextField
                            sx={{width: 300}}
                            size='small'
                            id="outlined-basic"
                            label="search by menu"
                            variant="outlined"
                            onKeyPress={(event) => onSearch(event)}
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
