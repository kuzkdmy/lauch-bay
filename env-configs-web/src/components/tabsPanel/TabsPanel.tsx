import React, { FC, useEffect, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import { useTypedSelector } from '../../redux/hooks/useTypedSelector';
import { useActions } from '../../redux/hooks/useActions';
import { Alert } from '@mui/material';
import { TabContent } from '../../types/types';

interface TabsPanelProps {
    tabsContent: TabContent[];
    onChange: () => void;
    onTabClick: any;
}

const TabPanel = (props: any) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography component={'span'}>{children}</Typography>
                </Box>
            )}
        </div>
    );
};

const TabsPanel: FC<TabsPanelProps> = ({
    tabsContent,
    onChange,
    onTabClick,
}) => {
    const { closeMenu } = useActions();
    const { openedItems, activeTabName } = useTypedSelector(
        (state) => state.menu
    );
    const { setActiveTabName } = useActions();
    const [value, setValue] = useState(0);

    useEffect(() => {
        const activeTabIndex = openedItems.findIndex(
            (el) => el.name === activeTabName
        );
        setValue(activeTabIndex === -1 ? 0 : activeTabIndex);
    }, [activeTabName, openedItems]);

    const handleChange = (event: any, index: number) => {
        setValue(index);
        setActiveTabName(openedItems[index].name);
        onChange();
    };

    return openedItems.length ? (
        <Box sx={{ maxWidth: '600' }}>
            <Box sx={{ borderColor: 'divider', backgroundColor: '#d8e6f5' }}>
                <Tabs
                    value={value}
                    sx={{
                        height: 3,
                        '.MuiTabs-scroller': { marginTop: '-10px' },
                    }}
                    scrollButtons="auto"
                    variant="scrollable"
                    aria-label="scrollable auto tabs"
                    onChange={handleChange}
                >
                    {openedItems.map((i, index) => (
                        <Tab
                            sx={{ '&.Mui-selected': { color: '#0e0e0e' } }}
                            label={i.name}
                            onClick={() => onTabClick(i.type, i.id)}
                            icon={
                                <CloseIcon
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (
                                            activeTabName ===
                                            openedItems[index]?.name
                                        ) {
                                            setActiveTabName(
                                                openedItems[index - 1]?.name
                                            );
                                        }
                                        onChange();
                                        closeMenu({
                                            name: i.name,
                                            type: i.type,
                                        });
                                    }}
                                    sx={{
                                        fontSize: 14,
                                        marginLeft: 0,
                                        marginBottom: 2,
                                    }}
                                />
                            }
                            iconPosition="end"
                            key={i.name}
                        />
                    ))}
                </Tabs>
            </Box>
            {tabsContent?.map((item: TabContent, index: number) => (
                <TabPanel value={value} index={index} key={index}>
                    {item.content}
                </TabPanel>
            ))}
        </Box>
    ) : (
        <Alert severity="info">
            There are no selected configs, choose one or create new
        </Alert>
    );
};

export default TabsPanel;
