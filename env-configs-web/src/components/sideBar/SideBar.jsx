import * as React from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import SideBarItem from './SideBarItem';
import {connect} from 'react-redux';

const SideBar = (props) => {
    return (
        <List
            sx={{width: '100%', maxWidth: 360, maxHeight: 300}}
            component='nav'
            aria-labelledby='nested-list-subheader'
            subheader={
                <ListSubheader component='div' id='nested-list-subheader' sx={{backgroundColor: '#fafafa'}}>
                    Environment Configs
                </ListSubheader>
            }
        >
            <SideBarItem {...props.items}/>
        </List>
    );
}

const mapPropertyState = (state) => {
    return {
        items: state.sideBarItemReducer.items
    }
}

export default connect(mapPropertyState)(SideBar);