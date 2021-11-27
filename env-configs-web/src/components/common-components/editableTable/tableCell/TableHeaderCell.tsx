import React, { FC, useEffect, useState } from 'react';
import ArrowDown from '@mui/icons-material/ArrowDownward';
import ArrowUp from '@mui/icons-material/ArrowUpward';
import TableCell from '@mui/material/TableCell';

interface TableHeaderCellProps {
    column?: any;
    isEdit: boolean;
    style: any;
    onSort?: (sort: string) => void;
}
const TableHeaderCell: FC<TableHeaderCellProps> = ({
    column,
    onSort,
    style,
    isEdit,
}) => {
    const [sort, setSort] = useState('');

    useEffect(() => {
        setSort('');
    }, [isEdit]);

    return (
        <TableCell
            align="center"
            sortDirection={'asc'}
            size="small"
            onClick={() => {
                if (column?.sortable) {
                    if (onSort) {
                        const order = sort === 'desc' ? 'asc' : 'desc';
                        setSort(order);
                        onSort(order);
                    }
                }
            }}
            style={style}
        >
            {!isEdit && column?.sortable && sort && (
                <div className="sort-table-col">
                    {sort === 'asc' ? (
                        <ArrowDown sx={{ fontSize: 16 }} />
                    ) : (
                        <ArrowUp sx={{ fontSize: 16 }} />
                    )}
                </div>
            )}
            {column?.getLabel()}
        </TableCell>
    );
};

export default TableHeaderCell;
