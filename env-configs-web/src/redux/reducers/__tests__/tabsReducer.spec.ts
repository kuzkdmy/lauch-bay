import { applyMiddleware, createStore } from 'redux';
import { rootReducer } from '../rootReducer';
import thunk from 'redux-thunk';
import {
    addNewRowToConfig,
    closeTab,
    collapsiblePanelClick,
    editConfigItem,
    openTab,
    removeTabFromEditState,
    setActiveTabId,
} from '../../actions/tabActions';
import { ConfigType, TabItemType } from '../../../types/types';
import {
    addEmptyDeployments,
    envConfPanelId,
    getEmptyConfigRow,
    getEmptyEnvConf,
    kubDeploymentsPanelId,
    replaceDeployConf,
} from '../../../components/utils/configTabsUtils';

describe('tabs reducer, open and close tabs', () => {
    let store;
    beforeEach(
        () => (store = createStore(rootReducer, applyMiddleware(thunk)))
    );

    const globalTab: TabItemType = {
        id: 'global-id',
        name: 'Global',
        type: ConfigType.GLOBAL,
    };
    const projectsTab: TabItemType = {
        id: 'projects-id',
        name: 'Projects',
        type: ConfigType.PROJECT,
    };

    const openNewTab = (tab: TabItemType) => {
        store.dispatch(openTab(tab));
    };

    const openProjectsAndClickOnCollapsedPanel = (
        projectTab: TabItemType,
        collapsiblePanel = projectTab
    ) => {
        openNewTab(projectsTab);
        store.dispatch(collapsiblePanelClick(collapsiblePanel, true));
    };

    it('opens Global tab', () => {
        openNewTab(globalTab);

        expect(store.getState().tabState.openedTabs.length).toBe(1);
        expect(store.getState().tabState.openedTabs[0]).toEqual(globalTab);
    });

    it('closes Global tab', () => {
        openNewTab(globalTab);
        expect(store.getState().tabState.openedTabs.length).toBe(1);

        store.dispatch(closeTab(globalTab));
        expect(store.getState().tabState.openedTabs.length).toBe(0);
    });

    it('opens Projects, add proj#1 project to collapsiblePanel state', () => {
        const projectTab: TabItemType = {
            id: 'proj#1',
            name: 'project_#1',
            type: ConfigType.PROJECT,
        };
        openProjectsAndClickOnCollapsedPanel(projectTab);

        expect(store.getState().tabState.openedTabs.length).toBe(1);
        expect(
            store.getState().tabState.collapsiblePanelState[projectTab.id]
        ).toBe(true);
    });

    it('opens Projects tab, add proj#2 to collapsiblePanel state, then close Projects tab', () => {
        const projectTab: TabItemType = {
            id: 'proj#2',
            name: 'project_#2',
            type: ConfigType.PROJECT,
        };
        openProjectsAndClickOnCollapsedPanel(projectTab);

        expect(store.getState().tabState.openedTabs.length).toBe(1);
        expect(
            store.getState().tabState.collapsiblePanelState[projectTab.id]
        ).toBe(true);

        store.dispatch(closeTab(projectsTab));
        expect(store.getState().tabState.openedTabs.length).toBe(0);
        expect(
            Object.keys(store.getState().tabState.collapsiblePanelState).length
        ).toBe(0);
    });

    it('opens Projects tab, add proj#2 to collapsiblePanel state, then close global tab', () => {
        const projectTab: TabItemType = {
            id: 'proj#2',
            name: 'project_#2',
            type: ConfigType.PROJECT,
        };
        openNewTab(globalTab);
        openProjectsAndClickOnCollapsedPanel(projectTab);

        expect(store.getState().tabState.openedTabs.length).toBe(2);
        expect(
            store.getState().tabState.collapsiblePanelState[projectTab.id]
        ).toBe(true);

        store.dispatch(closeTab(globalTab));
        expect(store.getState().tabState.openedTabs.length).toBe(1);
        expect(
            store.getState().tabState.collapsiblePanelState[projectTab.id]
        ).toBe(true);
    });

    it('opens App tab, add app#1 kub deployments panel to collapsiblePanel state', () => {
        const appTab: TabItemType = {
            id: 'app#1',
            name: 'app_#1',
            type: ConfigType.APPLICATION,
        };
        const kubDepPanelKey = kubDeploymentsPanelId(appTab.id);
        openProjectsAndClickOnCollapsedPanel(appTab, {
            ...appTab,
            id: kubDepPanelKey,
        });
        expect(
            store.getState().tabState.collapsiblePanelState[kubDepPanelKey]
        ).toBe(true);
    });

    it('opens App tab, add app#1 env configs panel to collapsiblePanel state', () => {
        const appTab: TabItemType = {
            id: 'app#1',
            name: 'app_#1',
            type: ConfigType.APPLICATION,
        };
        const envConfPanelKey = envConfPanelId(appTab.id);
        openProjectsAndClickOnCollapsedPanel(appTab, {
            ...appTab,
            id: envConfPanelKey,
        });
        expect(
            store.getState().tabState.collapsiblePanelState[envConfPanelKey]
        ).toBe(true);
    });

    it('opens App tab, add app#1 env configs panel to collapsiblePanel state, then close App tab', () => {
        const appTab: TabItemType = {
            id: 'app#1',
            name: 'app_#1',
            type: ConfigType.APPLICATION,
        };
        const envConfPanelKey = envConfPanelId(appTab.id);
        openProjectsAndClickOnCollapsedPanel(appTab, {
            ...appTab,
            id: envConfPanelKey,
        });
        expect(
            store.getState().tabState.collapsiblePanelState[envConfPanelKey]
        ).toBe(true);

        store.dispatch(closeTab(appTab));
        expect(
            Object.keys(store.getState().tabState.collapsiblePanelState).length
        ).toBe(0);
    });

    it('opens Projects tab, App tab, add app#1 env configs panel to collapsiblePanel state, then close Projects tab', () => {
        const appTab: TabItemType = {
            id: 'app#1',
            name: 'app_#1',
            type: ConfigType.APPLICATION,
        };
        const envConfPanelKey = envConfPanelId(appTab.id);
        openProjectsAndClickOnCollapsedPanel(projectsTab);
        openProjectsAndClickOnCollapsedPanel(appTab, {
            ...appTab,
            id: envConfPanelKey,
        });
        expect(
            store.getState().tabState.collapsiblePanelState[envConfPanelKey]
        ).toBe(true);

        store.dispatch(closeTab(projectsTab));
        expect(
            store.getState().tabState.collapsiblePanelState[envConfPanelKey]
        ).toBe(true);
    });

    it('opens Projects tab, App tab, add app#1 kub deployments panel to collapsiblePanel state, then close Projects tab', () => {
        const appTab: TabItemType = {
            id: 'app#1',
            name: 'app_#1',
            type: ConfigType.APPLICATION,
        };
        const kubDepPanelKey = kubDeploymentsPanelId(appTab.id);
        openProjectsAndClickOnCollapsedPanel(projectsTab);
        openProjectsAndClickOnCollapsedPanel(appTab, {
            ...appTab,
            id: kubDepPanelKey,
        });
        expect(
            store.getState().tabState.collapsiblePanelState[kubDepPanelKey]
        ).toBe(true);

        store.dispatch(closeTab(projectsTab));
        expect(
            store.getState().tabState.collapsiblePanelState[kubDepPanelKey]
        ).toBe(true);
    });

    it('opens Projects tab, App tab, add app#1 kub deployments panel, project panel to collapsiblePanel state, then close App tab', () => {
        const appTab: TabItemType = {
            id: 'app#1',
            name: 'app_#1',
            type: ConfigType.APPLICATION,
        };
        const kubDepPanelKey = kubDeploymentsPanelId(appTab.id);
        openProjectsAndClickOnCollapsedPanel(projectsTab);
        openProjectsAndClickOnCollapsedPanel(appTab, {
            ...appTab,
            id: kubDepPanelKey,
        });
        expect(
            store.getState().tabState.collapsiblePanelState[kubDepPanelKey]
        ).toBe(true);

        store.dispatch(closeTab(appTab));
        expect(
            store.getState().tabState.collapsiblePanelState[projectsTab.id]
        ).toBe(true);
    });

    it('sets App tab as active', () => {
        const appTab: TabItemType = {
            id: 'app#1',
            name: 'app_#1',
            type: ConfigType.APPLICATION,
        };
        openNewTab(globalTab);
        store.dispatch(setActiveTabId(globalTab.id));
        openNewTab(appTab);
        store.dispatch(setActiveTabId(appTab.id));

        expect(store.getState().tabState.activeTabId).toEqual(appTab.id);
    });
});

describe('tabs reducer, edit tab configs', () => {
    let store;
    beforeEach(
        () => (store = createStore(rootReducer, applyMiddleware(thunk)))
    );

    it('edits new config', () => {
        const config = { ...getEmptyConfigRow(), id: 'config-id' };
        store.dispatch(editConfigItem(config));

        expect(store.getState().tabState.editTabs[config.id]).toEqual(config);
    });

    it('removes tab from edit state', () => {
        const config = { ...getEmptyConfigRow(), id: 'config-id' };
        store.dispatch(editConfigItem(config));
        expect(store.getState().tabState.editTabs[config.id]).toEqual(config);

        store.dispatch(removeTabFromEditState(config.id));
        expect(store.getState().tabState.editTabs[config.id]).toEqual(
            undefined
        );
    });

    it('edits new config, add new row', () => {
        const config = {
            ...getEmptyConfigRow(),
            id: 'config-id',
            envConf: [getEmptyEnvConf('')],
        };
        store.dispatch(editConfigItem(config));

        expect(store.getState().tabState.editTabs[config.id]).toEqual(config);
        expect(
            store.getState().tabState.editTabs[config.id].envConf.length
        ).toBe(1);

        store.dispatch(addNewRowToConfig(config.id));

        expect(store.getState().tabState.editTabs[config.id]).toEqual({
            ...config,
            envConf: [...config.envConf, getEmptyEnvConf(null)],
        });
        expect(
            store.getState().tabState.editTabs[config.id].envConf.length
        ).toBe(2);
    });

    it('edits existing config', () => {
        const config = {
            ...getEmptyConfigRow(),
            id: 'config-id',
            deployConf: addEmptyDeployments([
                { ...getEmptyEnvConf(3), type: 'replica' },
            ]),
        };
        store.dispatch(editConfigItem(config));

        expect(store.getState().tabState.editTabs[config.id]).toEqual(config);

        const updatedEnvConfConfig = {
            ...config,
            envConf: [{ ...getEmptyEnvConf(''), default: 'default val' }],
        };
        const updatedDeployConfConfig = {
            ...getEmptyEnvConf(false),
            type: 'empty_dir_memory',
            envOverride: { dev: null, stage: true, prod: false },
        };
        store.dispatch(
            editConfigItem(updatedEnvConfConfig, updatedDeployConfConfig)
        );
        const expectedDeployConf = replaceDeployConf(
            updatedDeployConfConfig,
            config.deployConf
        );

        expect(store.getState().tabState.editTabs[config.id]).toEqual({
            ...updatedEnvConfConfig,
            deployConf: expectedDeployConf,
        });
    });
});
