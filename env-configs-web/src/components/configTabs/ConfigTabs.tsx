import React, {useState} from 'react'
import Typography from "@mui/material/Typography";
import {Button, Checkbox, FormControlLabel, FormGroup, IconButton, Menu, Tooltip} from "@mui/material";
import TabsPanel from "../tabsPanel/TabsPanel";
import {Config, Configs, ConfigsState, ConfigType, MenuItemType} from "../../types/types";
import _ from "lodash";
import {useActions} from "../../redux/hooks/useActions";
import {useTypedSelector} from "../../redux/hooks/useTypedSelector";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import EditableTable from "../basicTable/EditableTable";
import StyledListItemButton from "../listItem/listItem";

const ConfigTabs = () => {
    const {openMenu, refreshConfigs} = useActions();
    const {openedItems} = useTypedSelector(state => state.menu);
    const {configs} = useTypedSelector(state => state.configsState);

    const [isEdit, setIsEdit] = useState(false);
    const [showGlobal, setShowGlobal] = useState(false);
    const [showProject, setShowProject] = useState(false);


    const resetState = () => {
        setIsEdit(false);
        setShowProject(false);
        setShowGlobal(false);
    }

    const renderCreateNewConfig = () => {
        return (
            <div className='create-new-config-block'>
                <div className='create-new-config'>
                    <Typography variant="subtitle1" component="div" gutterBottom>
                        There are no any configs ...
                    </Typography>
                    <Button variant="contained" onClick={() => {
                    }}>Create New Config</Button>
                </div>
            </div>
        )
    }

    const getConfigValue = (val1: any, val2: any) => {
        if (!val2) {
            return val1;
        }
        return `${val1} -> ${val2}`
    }

    const mergeConfigs = (config: Configs, parentConfigs: any = []): Configs => {
        const overriddenEnvConf = parentConfigs?.envConf.map((p: Config) => {
            const confOverride = _.find(config.envConf, (conf: Config) => conf.envKey === p.envKey);
            if (!confOverride) {
                return p;
            }
            return {
                ...p,
                envOverride: {
                    dev: {
                        ...p.envOverride.dev,
                        value: getConfigValue(p.envOverride.dev?.value, confOverride.envOverride.dev?.value)
                    },
                    prod: {
                        ...p.envOverride.dev,
                        value: getConfigValue(p.envOverride.prod?.value, confOverride.envOverride.prod?.value)
                    },
                    stage: {
                        ...p.envOverride.dev,
                        value: getConfigValue(p.envOverride.stage?.value, confOverride.envOverride.stage?.value)
                    }
                }
            }
        }) as Config[];

        return {...parentConfigs, envConf: overriddenEnvConf}
    }

    const renderTableTabsContent = (item: MenuItemType) => {
        let config;
        if (Array.isArray(configs[item.type])) {
            config = _.find(configs[item.type], (val: any) => val.name === item.name);
        } else {
            config = configs[item.type];
        }

        return config && (
            <>
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
                    {item.type === ConfigType.PROJECT ?
                        (<FormControlLabel
                            className='check-box'
                            onChange={() => {
                                setShowGlobal(!showGlobal)
                            }}
                            control={<Checkbox/>}
                            label="Show global"/>) : null
                    }
                    {item.type === ConfigType.MICROSERVICE ?
                        (
                            <>
                                <FormControlLabel className='check-box' control={<Checkbox/>} onChange={() => {
                                    setShowGlobal(!showGlobal)
                                }} label="Show global"/>
                                <FormControlLabel className='check-box' control={<Checkbox/>} onChange={() => {
                                    setShowProject(!showProject)
                                }} label="Show project"/>
                            </>
                        ) : null
                    }
                    <IconButton
                        onClick={() => {
                            setIsEdit(!isEdit)
                        }}
                    >
                        {!isEdit ?
                            <Tooltip placement={'right-end'} title="Edit"><EditIcon color='primary'/></Tooltip> :
                            <Tooltip placement={'right-end'} title="Cancel"><CancelIcon color='secondary'/></Tooltip>
                        }
                    </IconButton>
                </FormGroup>
                <EditableTable sx={{marginBottom: 5}} isEdit={isEdit} rows={config as Configs}/>
                {
                    (item.parentConfigType && configs[item.parentConfigType] && (showGlobal || showProject)) &&
                    <>
                        <div className='parent-config'>{item.parentConfigType} config</div>
                        <EditableTable isEdit={false} rows={mergeConfigs(config as Configs, configs[item.parentConfigType])}/>
                    </>
                }
            </>
        );
    }

    const renderListTabsContent = (items: Configs[] | undefined, type: ConfigType, parentConfigType: ConfigType) => {
        return items?.map(item =>
            <StyledListItemButton
                onClick={() => openMenu(
                    {
                        name: item.name,
                        isTableContent: true,
                        type,
                        parentConfigType,
                        id: item.id
                    })
                }
                name={item.name}
                key={item.id}
            />
        );
    }

    const tabItems = openedItems?.map((item: MenuItemType) => {
        if (item.isTableContent) {
            return renderTableTabsContent(item) || renderCreateNewConfig();
        }
        const listTabsContent = renderListTabsContent(configs[item.type], item.type, item.parentConfigType!);
        return listTabsContent?.length ? listTabsContent : renderCreateNewConfig();
    });

    return (
        <TabsPanel
            tabsContent={tabItems}
            onChange={resetState}
            onTabClick={(type: ConfigType, id: string) => {refreshConfigs(type, id)}} />
    );
}

export default ConfigTabs;