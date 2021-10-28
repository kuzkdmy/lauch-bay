import {ADD_ITEM, FIND_ITEM} from "./actionTypes";

export const addItem = content => ({
    type: ADD_ITEM,
    payload: {
        id: 1,
        name: content,
        rows: [
            {id :1, name: `String_VAR_${Math.random().toFixed(2)}`, type: 'string', dev: `Hello World Dev ${Math.random().toFixed(2)}`, stage: `Hello World Stage ${Math.random().toFixed(2)}`},
            {id: 2, name: `Boolean_VAR_${Math.random().toFixed(2)}`, type: 'boolean', dev: 'true', stage: 'false'},
            {id: 3, name: `Boolean_VAR_${Math.random().toFixed(2)}`, type: 'boolean', dev: 'true', stage: 'false'},
            {id: 4, name: `Boolean_VAR_${Math.random().toFixed(2)}`, type: 'boolean', dev: 'true', stage: 'false'},
            {id: 5, name: `Boolean_VAR_${Math.random().toFixed(2)}`, type: 'boolean', dev: 'true', stage: 'false'}
        ]
    }
});

export const findItem = content => ({
    type: FIND_ITEM,
    payload: {
        id: 1,
        name: content
    }
});