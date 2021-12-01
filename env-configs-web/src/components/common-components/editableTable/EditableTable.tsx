import React, { FC, useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useActions } from '../../../redux/hooks/useActions';
import { useTypedSelector } from '../../../redux/hooks/useTypedSelector';
import { Config, TabItemType } from '../../../types/types';
import _ from 'lodash';
import EditableTableCell from './tableCell/EditableTableCell';
import TableHeaderCell from './tableCell/TableHeaderCell';
import CloseIcon from '@mui/icons-material/Close';
import { TableCell, Tooltip } from '@mui/material';

interface EditableTableProps {
    tabItem: TabItemType;
    activeTabId: string;
    config: Config[];
    columns: any[];
    updateColValue: (val: any, config: Config, colId: string) => any;
    sx?: any;
}

const EditableTable: FC<EditableTableProps> = ({
    sx,
    activeTabId,
    config,
    columns,
    updateColValue,
    tabItem,
}) => {
    const [isEdit, setIsEdit] = useState(false);
    const { editTabs } = useTypedSelector((state) => state.tabState);
    const { configs } = useTypedSelector((state) => state.configsState);
    const [tableRows, setTableRows] = useState(config || []);
    const [editingRow, setEditingRow] = useState({ idx: -1, colId: '' });

    const { editConfigItem } = useActions();

    const onRowEdit = (rowIndex: number, colId: string) => {
        setEditingRow({ idx: rowIndex, colId });
        setIsEdit(true);
    };

    const onEditingRowChange = (updatedRows?: Config[]) => {
        editConfigItem(
            {
                ...configs[tabItem.type][activeTabId],
                envConf: updatedRows || tableRows,
                id: activeTabId,
                confType: tabItem.type,
            },
            true
        );
    };

    useEffect(() => {
        setIsEdit(!!editTabs[activeTabId]);
        if (editTabs[activeTabId]) {
            setTableRows(editTabs[activeTabId]?.envConf);
        } else {
            setEditingRow({ idx: -1, colId: '' });
            setTableRows(config);
        }
    }, [activeTabId, configs, editTabs, tabItem.type]);

    const editTableRows = (value: any, colId: string) => {
        const updatedRows = [...tableRows];
        const configRow = updateColValue(
            value,
            tableRows[editingRow.idx],
            colId
        );
        updatedRows.splice(editingRow.idx, 1, configRow);
        setTableRows(updatedRows);
    };

    const onRowDelete = (rowIdx: number) => {
        const updatedTableRows = [...tableRows];
        updatedTableRows.splice(rowIdx, 1);
        setTableRows(updatedTableRows);
        onEditingRowChange(updatedTableRows);
    };

    const sortRows = (tableRows, direction) => {
        !isEdit &&
            setTableRows(
                direction === 'asc'
                    ? _.sortBy(tableRows, ['envKey'])
                    : _.sortBy(tableRows, ['envKey']).reverse()
            );
    };

    const isRowInEditState = (rowIdx: number) => {
        return editingRow.idx === rowIdx;
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
                            {columns.map((column, idx) => (
                                <TableHeaderCell
                                    key={idx}
                                    isEdit={isEdit}
                                    column={column}
                                    onSort={(order) =>
                                        sortRows(tableRows, order)
                                    }
                                    style={{
                                        width: column.minWidth,
                                        backgroundColor: '#585959',
                                        color: 'white',
                                        padding: '0',
                                        fontSize: 16,
                                        cursor: column.sortable
                                            ? 'pointer'
                                            : 'default',
                                    }}
                                />
                            ))}
                            <TableHeaderCell
                                isEdit={isEdit}
                                style={{
                                    width: '10px',
                                    backgroundColor: '#585959',
                                }}
                            />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableRows?.map((row, rowIdx) => {
                            return (
                                <TableRow
                                    hover
                                    role="checkbox"
                                    tabIndex={-1}
                                    key={rowIdx}
                                    sx={{
                                        cursor: 'pointer',
                                        height: '30px',
                                        backgroundColor:
                                            rowIdx % 2 !== 0 ? '#f5f5f5' : '',
                                    }}
                                >
                                    {columns.map((col: any, index) => {
                                        return (
                                            <EditableTableCell
                                                config={tableRows[rowIdx]}
                                                key={index + col.id}
                                                colIdx={index}
                                                onRowEdit={() => {
                                                    onRowEdit(rowIdx, col.id);
                                                }}
                                                isRowInEditState={() => {
                                                    return isRowInEditState(
                                                        rowIdx
                                                    );
                                                }}
                                                onBlur={() => {
                                                    if (isEdit) {
                                                        onEditingRowChange();
                                                    }
                                                }}
                                                autoFocus={
                                                    editingRow.colId === col.id
                                                }
                                                onChange={(
                                                    val: any,
                                                    colId: string
                                                ) => {
                                                    editTableRows(val, colId);
                                                }}
                                                column={col}
                                            />
                                        );
                                    })}
                                    <TableCell
                                        size="small"
                                        sx={{
                                            width: '10px%',
                                            padding: '5px',
                                        }}
                                    >
                                        <Tooltip
                                            placement={'left-start'}
                                            title="Delete Row"
                                            sx={{
                                                '& .MuiSvgIcon-root': {
                                                    marginTop: '5px',
                                                },
                                            }}
                                        >
                                            <CloseIcon
                                                color={
                                                    isEdit
                                                        ? 'warning'
                                                        : 'disabled'
                                                }
                                                onClick={() => {
                                                    if (isEdit)
                                                        onRowDelete(rowIdx);
                                                }}
                                            />
                                        </Tooltip>
                                    </TableCell>
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
