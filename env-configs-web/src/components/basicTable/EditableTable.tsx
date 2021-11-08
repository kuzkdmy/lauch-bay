import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Input } from '@mui/material';
import { FC, useState } from 'react';
import { Config, Configs } from '../../types/types';

interface EditableTableProps {
    isEdit: boolean;
    rows: Configs;
    sx?: any;
}

const columns = [
    {
        id: 'envKey',
        label: 'Name',
        minWidth: 210,
        align: 'left',
        getValue: (row: Config) => row.envKey,
    },
    {
        id: 'type',
        label: 'Type',
        minWidth: 80,
        align: 'center',
        getValue: (row: Config) => row.type,
    },
    {
        id: 'default',
        label: 'Default',
        minWidth: 150,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.default?.value,
    },
    {
        id: 'dev',
        label: 'Dev',
        minWidth: 150,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.envOverride.dev?.value,
    },
    {
        id: 'stage',
        label: 'Stage',
        minWidth: 150,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.envOverride.stage?.value,
    },
    {
        id: 'prod',
        label: 'Prod',
        minWidth: 150,
        align: 'center',
        format: (value: any) => value.toLocaleString('en-US'),
        getValue: (row: Config) => row.envOverride.prod?.value,
    },
];

const EditableTable: FC<EditableTableProps> = ({ isEdit, rows, sx }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [tableRows, setTableRows] = useState(rows.envConf);

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const onRowsChange = (event: any, row: any, colId: number) => {
        setTableRows(
            tableRows.map((r) => {
                // if (r.id === row.id) {
                //     return {...r, [colId]: event.target.value};
                // }
                return r;
            })
        );
    };

    const getTableCell = (col: any, row: any) => {
        return isEdit ? (
            <Input
                sx={{ fontSize: 14 }}
                value={col.getValue(row)}
                name={col.name}
                // onChange={e => onRowsChange(e, row, column.id)}
            />
        ) : (
            <>{col.getValue(row)}</>
        );
    };

    return (
        <Paper sx={{ ...sx, width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 240 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
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
                        {tableRows
                            .slice(
                                page * rowsPerPage,
                                page * rowsPerPage + rowsPerPage
                            )
                            .map((row, idx) => {
                                return (
                                    <TableRow
                                        hover
                                        role="checkbox"
                                        tabIndex={-1}
                                        key={row.envKey}
                                        sx={{
                                            backgroundColor:
                                                idx % 2 !== 0 ? '#f5f5f5' : '',
                                        }}
                                    >
                                        {columns.map((col) => {
                                            return (
                                                <TableCell
                                                    key={col.id}
                                                    align={
                                                        col.align as
                                                            | 'center'
                                                            | 'left'
                                                    }
                                                >
                                                    {getTableCell(col, row)}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            {/* <TablePagination */}
            {/*    rowsPerPageOptions={[10, 25, 100]} */}
            {/*    component="div" */}
            {/*    count={0} */}
            {/*    rowsPerPage={rowsPerPage} */}
            {/*    page={page} */}
            {/*    onPageChange={handleChangePage} */}
            {/*    onRowsPerPageChange={handleChangeRowsPerPage} */}
            {/* /> */}
        </Paper>
    );
};

export default EditableTable;
