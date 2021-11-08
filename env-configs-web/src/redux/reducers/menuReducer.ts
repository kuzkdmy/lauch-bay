import {MenuActions, MenuActionTypes, MenuState} from "../../types/types";

const initialState = {
    openedItems: [] as any[]
}

const menuReducer =
    (state = initialState, action: MenuActions): MenuState => {
        switch (action.type) {
            case MenuActionTypes.OPEN_MENU_ITEM:
                if (!state.openedItems.map(item => item.name).includes(action.payload?.name)) {
                    return {openedItems: [...state.openedItems, action.payload]}
                }
                return state;
            case MenuActionTypes.CLOSE_MENU_ITEM:
                return {openedItems: state.openedItems.filter((i: any) => {return i.name !== action.payload?.name})}
            default: {
                return state;
            }
        }
    };

export default menuReducer;