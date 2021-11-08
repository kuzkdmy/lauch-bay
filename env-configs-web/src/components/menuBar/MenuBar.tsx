import * as React from 'react';
import {useEffect} from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import List from '@mui/material/List';
import ListItemText from "@mui/material/ListItemText";
import {Button, ListItemButton, TextField} from "@mui/material";
import {useActions} from "../../redux/hooks/useActions";
import {fetchProjectConfigs} from "../../redux/actions/configsActions";
import {ConfigType} from "../../types/types";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";

const MenuBar = () => {

    const {fetchGlobalConfigs, fetchProjectConfigs, openMenu} = useActions();

    useEffect(() => {
        fetchGlobalConfigs()
    }, [])

    return (
        <List
            sx={{width: '100%', maxWidth: 360}}
            component='nav'
            aria-labelledby='nested-list-subheader'
            subheader={
                <div className='menu-sub-header'>
                    <LibraryBooksIcon color={'info'}/>
                    <ListSubheader component='div' id='nested-list-subheader' sx={{backgroundColor: '#fafafa'}}>
                        Environment Configs
                    </ListSubheader>
                </div>
            }
        >
            <TextField
                sx={{width: '92%', margin: '15px 10px 15px'}}
                size='small'
                id="outlined-basic"
                label="search by menu"
                variant="outlined"
                onKeyPress={(event) => {}}
            />
            <Button variant='outlined' sx={{margin: '0 10px 30px'}} onClick={() => {}}>Create New Config</Button>
            <ListItemButton onClick={() => {
                openMenu({name: 'Global', type: ConfigType.GLOBAL, isTableContent: true})
            }}>
                <ListItemText primary='Global'/>
                <SettingsEthernetIcon color={'primary'}/>
            </ListItemButton>
            <ListItemButton onClick={() => {
                fetchProjectConfigs()
            }}>
                <ListItemText primary='Projects'/>
                <SettingsEthernetIcon color={'secondary'}/>
            </ListItemButton>
            <ListItemButton onClick={() => {
            }} disabled={true}>
                <ListItemText primary='Deployments'/>
                <SettingsEthernetIcon color={'error'}/>
            </ListItemButton>
            <ListItemButton onClick={() => {
            }} disabled={true}>
                <ListItemText primary='Releases'/>
                <SettingsEthernetIcon color={'success'}/>
            </ListItemButton>
        </List>

    );
}

export default MenuBar;