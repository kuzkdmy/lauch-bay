import * as React from 'react';
import {FC, useState} from "react";
import {connect} from "react-redux";
import {Button, Checkbox, FormControlLabel, FormGroup, IconButton} from "@mui/material";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import EditableTable from "../basicTable/EditableTable";
import {RootState} from "../../types/Types";

interface TabsPanelProps {
    items: any[];
}

function TabPanel(props: any) {
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

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const TabsPanel: FC<TabsPanelProps> = ({items}) => {
    const [value, setValue] = useState(0);
    const [isEdit, setIsEdit] = useState(false);

    const handleChange = (event: any, newValue: number) => {
        setIsEdit(false);
        setValue(newValue);
    };

    return items.length ? (
        <Box sx={{maxWidth: '600'}}>
            <Box sx={{borderBottom: 1, borderColor: 'divider', backgroundColor: '#e3e3e3'}}>
                <Tabs sx={{width: 845}}
                      value={value}
                      scrollButtons="auto"
                      variant='scrollable'
                      aria-label="scrollable auto tabs"
                      onChange={handleChange}>
                    {items?.map((i, index) =>
                        <Tab sx={{'&.Mui-selected': {color: '#0e0e0e'}}} label={i.name} {...a11yProps(index)}/>
                    )}
                </Tabs>
            </Box>
            {items?.map((item, index) =>
                <TabPanel value={value} index={index}>
                    <FormGroup sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        margin: '5px 25px 20px'
                    }}>
                        <Button
                            variant="outlined"
                            disabled={!isEdit}
                            sx={{marginRight: 10, height: 30, width: 120}}>
                            Save
                        </Button>
                        <FormControlLabel className='check-box' control={<Checkbox />} label="Show global" />
                        <FormControlLabel className='check-box' control={<Checkbox />} label="Show project" />
                        <IconButton
                            onClick={() => {setIsEdit(!isEdit)}}
                        >
                            {!isEdit ? <EditIcon/> : <CancelIcon/>}
                        </IconButton>
                    </FormGroup>
                    <EditableTable isEdit={isEdit} rows={item.rows}/>
                </TabPanel>)
            }
        </Box>
    ) : null;
}

const mapPropertyState = (state: RootState) => {
    return {
        items: state.menuItems.openedItems
    }
}

export default connect(mapPropertyState)(TabsPanel);