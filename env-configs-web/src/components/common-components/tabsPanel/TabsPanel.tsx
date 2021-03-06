import React, { FC, useEffect, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import { useActions } from '../../../redux/hooks/useActions';
import { Alert } from '@mui/material';
import { TabContent } from '../../../types/types';

interface TabsPanelProps {
    tabsContent: () => any[];
    tabs: any[];
    sx?: any;
    onTabChange: (event: any, tabIndex: number) => void;
    isClosable?: boolean;
    isTitleUpperCase?: boolean;
    activeTabId: string;
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
    activeTabId,
    tabs,
    isClosable,
    sx,
    isTitleUpperCase,
    onTabChange,
    onTabClick,
}) => {
    const { closeTab } = useActions();
    const { setActiveTabId, removeTabFromEditState } = useActions();
    const [value, setValue] = useState(0);

    useEffect(() => {
        const activeTabIndex = tabs.findIndex((el) => el.id === activeTabId);
        setValue(activeTabIndex === -1 ? 0 : activeTabIndex);
    }, [tabs, activeTabId]);

    return tabs?.length ? (
        <Box sx={{ maxWidth: '600' }}>
            <Box
                sx={{
                    borderColor: 'divider',
                    backgroundColor: '#d8e6f5',
                }}
            >
                <Tabs
                    value={value}
                    sx={{
                        height: 3,
                        '.MuiTabs-scroller': { marginTop: '-10px' },
                    }}
                    scrollButtons="auto"
                    variant="scrollable"
                    aria-label="scrollable auto tabs"
                    onChange={onTabChange}
                >
                    {tabs.map((tab: any, index: number) => (
                        <Tab
                            sx={{
                                ...sx,
                                '&.Mui-selected': { color: '#0e0e0e' },
                                textTransform: isTitleUpperCase
                                    ? 'uppercase'
                                    : 'inherit',
                            }}
                            label={tab.name}
                            onClick={() => {
                                onTabClick(tab.type, tab.name, tab.id);
                            }}
                            icon={
                                <CloseIcon
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (activeTabId === tabs[index]?.id) {
                                            setActiveTabId(tabs[index - 1]?.id);
                                        }
                                        closeTab({
                                            name: tab.name,
                                            id: tab.id,
                                            type: tab.type,
                                        });
                                        removeTabFromEditState(tab.id);
                                    }}
                                    sx={{
                                        display: isClosable ? 'blocks' : 'none',
                                        fontSize: 14,
                                        marginLeft: 0,
                                        marginBottom: 2,
                                    }}
                                />
                            }
                            iconPosition="end"
                            key={tab.name}
                        />
                    ))}
                </Tabs>
            </Box>
            {tabsContent()?.map((item: TabContent, index: number) => (
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
