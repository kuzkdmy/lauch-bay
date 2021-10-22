import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import BasicTable from "../basicTable/BasicTable";
import {connect} from "react-redux";

function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{p: 3}}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const TabsPanel = ({items}) => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{maxWidth: '600'}}>
            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <Tabs sx={{maxWidth: 800}}
                      value={value}
                      scrollButtons="auto"
                      variant='scrollable'
                      aria-label="scrollable auto tabs example"
                      onChange={handleChange}>
                    {items?.map((i, index) =>
                        <Tab label={i.name} {...a11yProps(index)} />
                    )}
                </Tabs>
            </Box>
            {items.map((item, index) =>
                <TabPanel value={value} index={index}>
                    <BasicTable rows={item.rows}/>
                </TabPanel>)
            }
        </Box>
    );
}

const mapPropertyState = (state) => {
    return {
        items: state.sideBarItemReducer.openedItems
    }
}

export default connect(mapPropertyState)(TabsPanel);