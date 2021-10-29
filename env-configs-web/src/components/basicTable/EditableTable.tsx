import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import {Input} from "@mui/material";
import {FC, useState} from "react";

interface EditableTableProps {
    isEdit: boolean;
    rows: any[];
}

const columns = [
    {id: 'name', label: 'Name', minWidth: 120},
    {id: 'type', label: 'Type', minWidth: 80},
    {
        id: 'dev',
        label: 'Dev',
        minWidth: 150,
        align: 'right',
        format: (value: any) => value.toLocaleString('en-US'),
    },
    {
        id: 'stage',
        label: 'Stage',
        minWidth: 150,
        align: 'right',
        format: (value: any) => value.toLocaleString('en-US'),
    },
    {
        id: 'prod',
        label: 'Prod',
        minWidth: 120,
        align: 'right',
        format: (value: any) => value.toFixed(2),
    },
];

const EditableTable: FC<EditableTableProps> = ({isEdit, rows}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [tableRows, setTableRows] = useState(rows);

    const handleChangePage = (event: any, newPage: any) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: any) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const onRowsChange = (event: any, row: any, colId: number) => {
        setTableRows(
            tableRows.map(r => {
                if (r.id === row.id) {
                    return {...r, [colId]: event.target.value};
                }
                return r;
            })
        );
    }

    const getTableCell = (value: any, row: any, column: any) => {
        return isEdit ?
            <Input
                sx={{fontSize: 14}}
                value={value}
                name={row.name}
                onChange={e => onRowsChange(e, row, column.id)}
            /> :
            <>
                {column.format && typeof value === 'number'
                    ? column.format(value)
                    : value}
            </>;
    }

    return (
        <Paper sx={{width: '100%', overflow: 'hidden'}}>
            <TableContainer sx={{maxHeight: 240, maxWidth: 800}}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align='center'
                                    style={
                                        {
                                            minWidth: column.minWidth,
                                            backgroundColor: '#585959',
                                            color: 'white',
                                            fontSize: 16
                                        }
                                    }
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableRows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, idx) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.code}
                                              sx={{backgroundColor: idx % 2 !== 0 ? '#f5f5f5' : ''}}>
                                        {columns.map((column) => {
                                            return (
                                                <TableCell
                                                    key={column.id}
                                                    align='center'>
                                                    {getTableCell(row[column.id], row, column)}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}

export default EditableTable;