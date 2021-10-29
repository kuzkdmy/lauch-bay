import * as React from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import SideBarItem from './SideBarItem';
import {connect} from 'react-redux';
import {RootState} from "../../types/Types";
import {FC} from "react";

interface SideBarProps {
    items: any;
}

const SideBar: FC<SideBarProps> = ({items}) => {
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
            <SideBarItem {...items}/>
        </List>
    );
}

const mapPropertyState = (state: RootState) => {
    return {
        items: state.menuItems.items
    }
}

export default connect(mapPropertyState)(SideBar);