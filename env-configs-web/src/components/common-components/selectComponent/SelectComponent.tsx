import React, { FC, useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

interface SelectProps {
    selectItems: any[];
    label: string;
    initValue: any;
    onChange: (event: any) => void;
}

const SelectComponent: FC<SelectProps> = ({
    selectItems,
    initValue,
    onChange,
}) => {
    const [value, setValue] = useState(initValue);

    const handleChange = (event: any) => {
        // setSelectedType(event.target.value);
        setValue(event.target.value);
        onChange(event.target.value);
    };
    return (
        <FormControl size="small" fullWidth>
            <Select
                sx={{
                    height: '30px',
                    position: 'relative',
                    width: '110px',
                    '&.MuiInputBase-root': {
                        fontSize: '14px',
                        lineHeight: '21px',
                    },
                }}
                id="type-select"
                value={value}
                onChange={handleChange}
            >
                {selectItems.map((i: any, idx: number) => (
                    <MenuItem key={idx} value={i.value}>
                        {i.text}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default SelectComponent;
