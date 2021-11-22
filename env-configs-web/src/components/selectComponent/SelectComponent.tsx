import React, { FC, useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

interface SelectProps {
    selectItems: any[];
    label: string;
    initValue: any;
    onChange: (event: any) => void;
    setSelectedType: (type: any) => void;
}

const SelectComponent: FC<SelectProps> = ({
    setSelectedType,
    selectItems,
    initValue,
    onChange,
    label,
}) => {
    const [value, setValue] = useState(initValue);

    const handleChange = (event: any) => {
        setSelectedType(event.target.value);
        setValue(event.target.value);
        onChange(event.target.value);
    };
    return (
        <FormControl size="small" fullWidth={true}>
            <InputLabel id="type-select-label">{label}</InputLabel>
            <Select
                labelId="type-select-label"
                sx={{ height: '30px' }}
                id="type-select"
                label={label}
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
