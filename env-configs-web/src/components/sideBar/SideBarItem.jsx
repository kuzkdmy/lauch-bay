import * as React from "react";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import {addItem} from "../../redux/actions";
import {connect} from "react-redux";

const SideBarItem = (props) => {

    const {name, nestedItems, pl, addItem, topLevel, isOpened} = props;
    const [open, setOpen] = React.useState(isOpened);

    const handleClick = () => {
        setOpen(!open);
        if (!topLevel) {
            addItem(name);
        }
    };

    function getCollapse(item) {
        return <Collapse in={open} timeout="auto" unmountOnExit>
            <SideBarItem {...{...item, topLevel: false, pl: item.pl + 2, addItem}}/>
        </Collapse>;
    }

    return (
        <>
            <ListItemButton onClick={handleClick} sx={{pl}}>
                <ListItemText primary={name}/>
                {nestedItems && (open ? <ExpandLess/> : <ExpandMore/>)}
            </ListItemButton>
            {nestedItems?.map(nested => getCollapse({...nested, topLevel: false, pl}))}
        </>
    );
}

export default connect(null, {addItem})(SideBarItem);