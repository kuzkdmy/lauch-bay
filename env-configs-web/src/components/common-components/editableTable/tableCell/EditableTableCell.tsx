import { Input, Switch, TableCell, Tooltip } from '@mui/material';
import React, { FC } from 'react';
import { Config, ConfigType } from '../../../../types/types';
import SelectComponent from '../../selectComponent/SelectComponent';

interface TableCellProps {
    column: any;
    config: Config;
    colIdx: number;
    isRowInEditState: () => boolean;
    onBlur: () => void;
    autoFocus: boolean;
    onRowEdit: (rowIndex: number, colId: string) => void;
    onChange: (value: any, colId: string) => void;
    isInheritedConf?: boolean;
    confType?: ConfigType;
}

const EditableTableCell: FC<TableCellProps> = ({
    column,
    config,
    colIdx,
    isRowInEditState,
    onBlur,
    autoFocus,
    onRowEdit,
    isInheritedConf,
    onChange,
}) => {
    const getTableCell = () => {
        switch (true) {
            case column.id === 'envKey':
                return isRowInEditState() ? getInput() : renderValue();
            case column.id === 'type':
                return isRowInEditState() ? (
                    <SelectComponent
                        label="Type"
                        initValue={column.getValue(config)}
                        onChange={(value) => {
                            onChange(value, column.id);
                        }}
                        selectItems={[
                            { value: 'integer', text: 'integer' },
                            { value: 'string', text: 'string' },
                            { value: 'boolean', text: 'boolean' },
                        ]}
                    />
                ) : (
                    renderValue()
                );
            case config.type === 'boolean' && !isInheritedConf:
                return (
                    <Switch
                        size="small"
                        disabled={!isRowInEditState()}
                        value={column.getValue(config)}
                        checked={!!column.getValue(config)}
                        onChange={(e) => onChange(e.target.checked, column.id)}
                    />
                );
            default:
                return isRowInEditState() ? getInput() : renderValue();
        }
    };

    const renderValue = () => {
        const value = column.getValue(config) || '';

        return (
            <Tooltip
                title={value.length > 30 ? value : ''}
                placement="top-start"
            >
                <div className="col-val" style={{ width: column.minWidth }}>
                    {value}
                </div>
            </Tooltip>
        );
    };

    const getInput = () => {
        return (
            <Input
                autoComplete="off"
                sx={{
                    '&': {
                        backgroundColor: 'rgba(186, 187, 187, 0.1)',
                        padding: '5px',
                        height: '35px',
                    },
                    width: column.minWidth,
                }}
                inputProps={{
                    style: { fontSize: '14px' },
                }}
                disableUnderline={true}
                autoFocus={autoFocus}
                value={column.getValue(config)}
                name={column.id}
                onChange={(e) => {
                    onChange(e.target.value, column.id);
                }}
            />
        );
    };

    return (
        <TableCell
            size="small"
            sx={{
                width: column.minWidth,
                padding: '10px',
            }}
            onBlur={onBlur}
            onDoubleClick={() => {
                onRowEdit(colIdx, column.id);
            }}
            align={column.align as 'center' | 'left'}
        >
            {getTableCell()}
        </TableCell>
    );
};

export default EditableTableCell;
