import * as React from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import SideBarItem from "./SideBarItem";
import {connect} from "react-redux";

const SideBar = () => {

    return (
        <List
            sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper', maxHeight: 300}}
            component="nav"
            aria-labelledby="nested-list-subheader"
            subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                    Environment Configs
                </ListSubheader>
            }
        >
            <SideBarItem {...{name: 'Global', topLevel: true, nestedItems: [{name: 'global_name_1'}], pl: 2}}/>
            <SideBarItem {...{
                name: 'Projects',
                topLevel: true,
                nestedItems: [
                    {name: 'project_1', nestedItems: [{name: 'p1_microservice_1'}, {name: 'p1_microservice_2'}]},
                    {name: 'project_2', nestedItems: [{name: 'p2_microservice_1'}, {name: 'p2_microservice_2'}]},
                    {name: 'project_3', nestedItems: [{name: 'p3_microservice_1'}, {name: 'p3_microservice_2'}]},
                    {name: 'project_4', nestedItems: [{name: 'p4_microservice_1'}, {name: 'p4_microservice_2'}]}
                ],
                pl: 2
            }}/>
        </List>
    );
}

const mapPropertyState = (state) => {
    return {
        items: state.sideBarItemReducer.items
    }
}

export default connect(mapPropertyState)(SideBar);