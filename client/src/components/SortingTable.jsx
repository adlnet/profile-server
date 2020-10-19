/** ***************************************************************
* Copyright 2020 Advanced Distributed Learning (ADL)
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**************************************************************** */
import React from 'react';
import { useTable, useSortBy } from 'react-table';

const defaultPropGetter = () => ({})

export default function SortingTable({
    columns,
    data,
    emptyMessage,
    getHeaderProps = defaultPropGetter,
    getColumnProps = defaultPropGetter,
    getRowProps = defaultPropGetter,
    getCellProps = defaultPropGetter,
}) {

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow
    } = useTable({
        data,
        columns
    }, useSortBy);

    return (
        <table className="usa-table usa-table--borderless" width="100%" {...getTableProps()}>
            <thead>
                {headerGroups.map((headerGroup, i) => (

                    <tr key={`${i}-tr`} {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column, k) => (

                            <th key={`${k}-th`}
                                {...column.getHeaderProps([
                                    column.getSortByToggleProps(),
                                    {
                                        style: { paddingLeft: 0 }
                                    },
                                    {
                                        style: column.style,
                                        className: column.className
                                    },
                                    getColumnProps(column),
                                    getHeaderProps(column)])
                                }>
                                {column.render('Header')}

                                <span className="padding-left-1 font-sans-3xs text-primary-dark">
                                    {column.isSorted
                                        ? column.isSortedDesc
                                            ? <i className="fa fa-arrow-down"></i>
                                            : <i className="fa fa-arrow-up"></i>
                                        : ''}
                                </span>
                            </th>

                        ))}
                    </tr>

                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {
                    (rows && rows.length > 0) ?
                        rows.map(
                            (row, i) => {
                                prepareRow(row);
                                return (

                                    <tr key={`${i}-body-tr`} {...row.getRowProps(getRowProps(row))}>
                                        {row.cells.map((cell, cidx) => {
                                            return (

                                                <td key={`${i}-body-td`}
                                                    {...cell.getCellProps([
                                                        {
                                                            className: "font-sans-3xs",
                                                            style: { padding: '1.5rem 0' },
                                                        },
                                                        {
                                                            className: cell.column.cellClassName,
                                                            style: cell.column.cellStyle
                                                        },
                                                        getColumnProps(cell.column),
                                                        getCellProps(cell)])
                                                    }>

                                                    {cell.render('Cell')}

                                                </td>

                                            )
                                        })}
                                    </tr>

                                )
                            }
                        )
                        : <tr key={1}><td className="font-sans-xs" style={{ padding: '1.5rem 0' }} colSpan="6">{emptyMessage}</td></tr>
                }
            </tbody>
        </table>
    );
}
