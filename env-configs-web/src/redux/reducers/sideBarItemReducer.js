import {ADD_ITEM, FIND_ITEM} from "../actionTypes";
import * as React from "react";

const initialState = {
    items: {
        name: 'Global',
        topLevel: true,
        isOpened: false,
        nestedItems: [{
            name: 'global_name_1',
            topLevel: true,
            isOpened: false,
            nestedItems: [
                {
                    name: 'project_1',
                    nestedItems: [{name: 'p1_microservice_1', isOpened: false}, {
                        name: 'p1_microservice_2',
                        isOpened: false
                    }],
                    isOpened: false
                },
                {
                    name: 'project_2',
                    nestedItems: [{name: 'p2_microservice_1', isOpened: false}, {
                        name: 'p2_microservice_2',
                        isOpened: false
                    }],
                    isOpened: false
                },
                {
                    name: 'project_3',
                    nestedItems: [{name: 'p3_microservice_1', isOpened: false}, {
                        name: 'p3_microservice_2',
                        isOpened: false
                    }],
                    isOpened: false
                },
                {
                    name: 'project_4',
                    nestedItems: [{name: 'p4_microservice_1', isOpened: false}, {
                        name: 'p4_microservice_2',
                        isOpened: false
                    }],
                    isOpened: false
                }
            ],
            pl: 2
        }],
        pl: 2
    },
    openedItems: []
}

const findMenuItem = (name, item, state) => {
    if (!name) {
        return initialState.items;
    }
    if (item.name.includes(name)) {
        return {...item, isOpened: true};
    }
    if (!item.nestedItems) {
        return item;
    }

    const nestedItems = item.nestedItems.map(i => findMenuItem(name, i, state));

    return {
        ...item,
        isOpened: nestedItems.map(i => i.isOpened).reduce((i1, i2) => i1 || i2),
        nestedItems: nestedItems
    };
}

const sideBarItemReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_ITEM: {
            if (!state.openedItems.find(item => item.name === action.payload.name)) {
                return {...state, openedItems: [...state.openedItems, action.payload]};
            }
            return state;
        }
        case FIND_ITEM: {
            return {...state, items: findMenuItem(action.payload.name, state.items, state)};
        }
        default: {
            return state;
        }
    }
};

export default sideBarItemReducer;