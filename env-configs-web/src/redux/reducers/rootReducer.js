import { combineReducers } from "redux";
import sideBarItemReducer from "./sideBarItemReducer";

export default combineReducers({ menuItems: sideBarItemReducer });