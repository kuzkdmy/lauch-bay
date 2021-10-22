import {ADD_ITEM, FIND_ITEM} from "../actionTypes";
import SideBarItem from "../../components/sideBar/SideBarItem";
import * as React from "react";

const initialState = {
    items: {
        ...{
            name: 'Global',
            topLevel: true,
            isOpened: false,
            nestedItems: [{
                name: 'global_name_1',
                topLevel: true,
                isOpened: false,
                nestedItems: [
                    {name: 'project_1', nestedItems: [{name: 'p1_microservice_1', isOpened: false}, {name: 'p1_microservice_2', isOpened: false}], isOpened: false},
                    {name: 'project_2', nestedItems: [{name: 'p2_microservice_1', isOpened: false}, {name: 'p2_microservice_2', isOpened: false}], isOpened: false},
                    {name: 'project_3', nestedItems: [{name: 'p3_microservice_1', isOpened: false}, {name: 'p3_microservice_2', isOpened: false}], isOpened: false},
                    {name: 'project_4', nestedItems: [{name: 'p4_microservice_1', isOpened: false}, {name: 'p4_microservice_2', isOpened: false}], isOpened: false}
                ],
                pl: 2
            }],
            pl: 2
        }
    },
    openedItems: []
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
            console.log(action.payload.name)
        }
        default: {
            return state;
        }
    }
};

export default sideBarItemReducer;