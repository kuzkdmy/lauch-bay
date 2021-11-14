import * as React from 'react';
import { FC, useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Checkbox, Input, Switch, Tooltip } from '@mui/material';
import { columnsConfig } from './tableConfig';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SelectItem from '../listItem/SelectItem';
import { useActions } from '../../redux/hooks/useActions';
import { getColUpdateValue } from './utils/tableUtils';
import { useTypedSelector } from '../../redux/hooks/useTypedSelector';
import { Config } from '../../types/types';

interface EditableTableProps {
    onRowsRemove?: any;
    sx?: any;
}

const EditableTable: FC<EditableTableProps> = ({ sx, onRowsRemove }) => {
    const [rowType, setRowType] = useState('text');
    const [isEdit, setIsEdit] = useState(false);

    const { editTabs, activeTabId } = useTypedSelector((state) => state.menu);
    const { configs } = useTypedSelector((state) => state.configsState);

    const [tableRows, setTableRows] = useState(configs[activeTabId]?.envConf);
    const [editingRow, setEditingRow] = useState({ idx: 0, isEdit: false });

    const { editConfigItem } = useActions();

    const onRowEdit = (isChecked: boolean, rowIndex: number) => {
        setEditingRow({ idx: rowIndex, isEdit: isChecked });
    };

    const onEditingRowChange = (updatedRows?: Config[]) => {
        editConfigItem(
            {
                ...configs[activeTabId],
                envConf: updatedRows || tableRows,
                confType: editTabs[activeTabId].confType,
            },
            isEdit
        );
    };

    useEffect(() => {
        setIsEdit(editTabs[activeTabId]);
        if (editTabs[activeTabId]) {
            setTableRows(editTabs[activeTabId]?.envConf);
        } else {
            setTableRows(configs[activeTabId]?.envConf);
        }
    }, [activeTabId, configs, editTabs]);

    const onRowsChange = (value: any, colId: string) => {
        const updatedRows = [...tableRows];
        const configRow = getColUpdateValue(
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

    const getSimpleInput = (col: any, idx: number) => {
        return (
            <Input
                sx={{
                    fontSize: 14,
                    width: '95%',
                    paddingLeft: col.paddingLeft,
                }}
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
                    ? getSimpleInput(col, idx)
                    : renderValue(col, idx);
            case col.id === 'type':
                return isRowInEditState(idx) ? (
                    <SelectItem
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
            <TableCell size="small" sx={{ width: '5%' }}>
                <div className="table-edit-icons">
                    <Tooltip
                        placement={'left'}
                        title="Edit Row"
                        sx={{ padding: 0 }}
                    >
                        <Checkbox
                            sx={{
                                '& .MuiSvgIcon-root': { fontSize: 21 },
                                '&': { padding: '0 10px 0 0' },
                            }}
                            checked={isRowInEditState(idx)}
                            onChange={(e) => {
                                onRowEdit(e.target.checked, idx);
                                onEditingRowChange();
                            }}
                        />
                    </Tooltip>
                    {isRowInEditState(idx) && (
                        <Tooltip
                            placement={'top'}
                            title="Delete Row"
                            sx={{ '& .MuiSvgIcon-root': { marginTop: '5px' } }}
                        >
                            <DeleteForeverIcon
                                color={'warning'}
                                onClick={() => {
                                    onRowDelete();
                                }}
                            />
                        </Tooltip>
                    )}
                </div>
            </TableCell>
        );
    };

    return (
        <Paper sx={{ ...sx, width: '100%', overflow: 'hidden' }}>
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
                                        width: '5%',
                                        backgroundColor: '#585959',
                                        color: 'white',
                                        fontSize: 10,
                                    }}
                                />
                            )}
                            {columnsConfig().map((column, idx) => (
                                <TableCell
                                    key={column.id + idx}
                                    align="center"
                                    size="small"
                                    style={{
                                        minWidth: column.minWidth,
                                        backgroundColor: '#585959',
                                        color: 'white',
                                        fontSize: 16,
                                    }}
                                >
                                    {column.label}
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
                                        backgroundColor:
                                            idx % 2 !== 0 ? '#f5f5f5' : '',
                                    }}
                                >
                                    {isEdit && getEditRowCell(idx)}
                                    {columnsConfig().map((col) => {
                                        return (
                                            <TableCell
                                                key={col.id + idx}
                                                sx={{
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
