import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Input, Switch, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SelectComponent from '../selectComponent/SelectComponent';
import { useActions } from '../../redux/hooks/useActions';
import { useTypedSelector } from '../../redux/hooks/useTypedSelector';
import { Config, TabItemType } from '../../types/types';

interface EditableTableProps {
    tabItem: TabItemType;
    activeTabId: string;
    config: Config[];
    columns: any[];
    isDeletable?: boolean;
    updateColValue: (val: any, config: Config, colId: string) => any;
    tableEditableRows: {
        name: string;
        configs: Config[];
        dependentConfName: string;
        dependentConf: Config[];
    };
    sx?: any;
}

const EditableTable: FC<EditableTableProps> = ({
    sx,
    activeTabId,
    config,
    columns,
    isDeletable,
    updateColValue,
    tableEditableRows,
    tabItem,
}) => {
    const [rowType, setRowType] = useState('text');
    const [isEdit, setIsEdit] = useState(false);

    const { editTabs } = useTypedSelector((state) => state.tabState);
    const { configs } = useTypedSelector((state) => state.configsState);

    const [tableRows, setTableRows] = useState(config);
    const [editingRow, setEditingRow] = useState({ idx: 0, isEdit: false });

    const { editConfigItem } = useActions();

    const onRowEdit = (isChecked: boolean, rowIndex: number) => {
        setEditingRow({ idx: rowIndex, isEdit: isChecked });
    };

    const onEditingRowChange = (updatedRows?: Config[]) => {
        editConfigItem(
            {
                ...configs[tabItem.type][activeTabId],
                id: activeTabId,
                [tableEditableRows.dependentConfName]:
                    tableEditableRows.dependentConf,
                [tableEditableRows.name]: updatedRows || tableRows,
                confType: editTabs[activeTabId].confType,
            },
            isEdit
        );
    };

    useEffect(() => {
        setIsEdit(!!editTabs[activeTabId]);
        if (editTabs[activeTabId]) {
            setTableRows(tableEditableRows.configs || []);
        } else {
            setTableRows(config || []);
        }
    }, [activeTabId, configs, editTabs, tabItem.type]);

    const onRowsChange = (value: any, colId: string) => {
        const updatedRows = [...tableRows];
        const configRow = updateColValue(
            value,
            tableRows[editingRow.idx],
            colId
        );
        updatedRows.splice(editingRow.idx, 1, configRow);
        setTableRows(updatedRows);
    };

    const onRowDelete = () => {
        const updatedTableRows = [...tableRows];
        updatedTableRows.splice(editingRow.idx, 1);
        setTableRows(updatedTableRows);
        onEditingRowChange(updatedTableRows);
    };

    const getSimpleInput = (col: any, idx: number, autoFocus?: boolean) => {
        return (
            <Input
                sx={{
                    fontSize: 14,
                    width: col.minWidth,
                    paddingLeft: col.paddingLeft,
                }}
                autoFocus={autoFocus}
                value={col.getValue(tableRows[idx])}
                type={col.id === 'envKey' ? 'text' : rowType}
                name={col.id}
                onChange={(e) => onRowsChange(e.target.value, col.id)}
            />
        );
    };

    const renderValue = (col: any, idx: number) => {
        return <>{col.getValue(tableRows[idx])}</>;
    };

    const isRowInEditState = (idx: number) => {
        return isEdit && editingRow.idx === idx && editingRow.isEdit;
    };

    const getTableCell = (col: any, idx: number) => {
        switch (true) {
            case col.id === 'envKey':
                return isRowInEditState(idx)
                    ? getSimpleInput(col, idx, true)
                    : renderValue(col, idx);
            case col.id === 'type':
                return isRowInEditState(idx) ? (
                    <SelectComponent
                        setSelectedType={setRowType}
                        label="Type"
                        initValue={col.getValue(tableRows[idx])}
                        onChange={(value) => {
                            onRowsChange(value, col.id);
                        }}
                        selectItems={[
                            { value: 'integer', text: 'integer' },
                            { value: 'string', text: 'string' },
                            { value: 'boolean', text: 'boolean' },
                        ]}
                    />
                ) : (
                    renderValue(col, idx)
                );
            case tableRows[idx].type === 'boolean':
                return (
                    <Switch
                        size="small"
                        disabled={!isRowInEditState(idx)}
                        value={col.getValue(tableRows[idx])}
                        checked={!!col.getValue(tableRows[idx])}
                        onChange={(e) => onRowsChange(e.target.checked, col.id)}
                    />
                );
            default:
                return isRowInEditState(idx)
                    ? getSimpleInput(col, idx)
                    : renderValue(col, idx);
        }
    };

    const getEditRowCell = (idx: number) => {
        return (
            <TableCell size="small" sx={{ width: '5px', padding: '5px 3px' }}>
                {isRowInEditState(idx) && isDeletable && (
                    <Tooltip
                        placement={'top'}
                        title="Delete Row"
                        sx={{ '& .MuiSvgIcon-root': { marginTop: '5px' } }}
                    >
                        <CloseIcon
                            color={'warning'}
                            onClick={() => {
                                onRowDelete();
                            }}
                        />
                    </Tooltip>
                )}
            </TableCell>
        );
    };

    return (
        <Paper sx={{ ...sx, overflow: 'hidden' }}>
            <TableContainer
                sx={{
                    maxHeight: sx.maxHeight || '40vh',
                }}
            >
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {isEdit && (
                                <TableCell
                                    align="center"
                                    size="small"
                                    style={{
                                        width: '5px',
                                        backgroundColor: '#585959',
                                        padding: '0',
                                        color: 'white',
                                        fontSize: 10,
                                    }}
                                />
                            )}
                            {columns.map((column, idx) => (
                                <TableCell
                                    key={column.id + idx}
                                    align="center"
                                    size="small"
                                    style={{
                                        width: column.minWidth,
                                        backgroundColor: '#585959',
                                        color: 'white',
                                        padding: '0',
                                        fontSize: 16,
                                    }}
                                >
                                    {column.getLabel(tableRows[idx])}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableRows?.map((row, idx) => {
                            return (
                                <TableRow
                                    hover
                                    role="checkbox"
                                    tabIndex={-1}
                                    key={idx}
                                    onBlur={() => {
                                        if (isEdit) {
                                            onEditingRowChange();
                                        }
                                    }}
                                    onClick={() => {
                                        if (isEdit) {
                                            setEditingRow({
                                                idx,
                                                isEdit: true,
                                            });
                                        }
                                    }}
                                    sx={{
                                        cursor: 'pointer',
                                        height: '30px',
                                        backgroundColor:
                                            idx % 2 !== 0 ? '#f5f5f5' : '',
                                    }}
                                >
                                    {isEdit && getEditRowCell(idx)}
                                    {columns.map((col) => {
                                        return (
                                            <TableCell
                                                size="small"
                                                key={col.id + idx}
                                                sx={{
                                                    width: col.minWidth,
                                                    padding: '10px',
                                                    paddingLeft: isEdit
                                                        ? col.paddingLeft
                                                        : 2,
                                                }}
                                                align={
                                                    col.align as
                                                        | 'center'
                                                        | 'left'
                                                }
                                            >
                                                {getTableCell(col, idx)}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default EditableTable;
