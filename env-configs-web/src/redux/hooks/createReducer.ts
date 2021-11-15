import { Reducer, Action } from 'redux';

export default function createReducer<E>(
    handlers: {
        [index: string]: (state: E, action: Action) => E;
    },
    initialState: E
): Reducer<E> {
    return (state = initialState, action) => {
        const handler = handlers[action.type];
        return handler ? handler(state, action) : state;
    };
}
