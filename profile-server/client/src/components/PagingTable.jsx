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
import { useTable, usePagination } from 'react-table';

const defaultPropGetter = () => ({})

export default function PagingTable({
    searchTerm,
    clearSearch,
    columns,
    data,
    emptyMessage,
    showPageHeader = true,
    resourceType = "working groups",
    getHeaderProps = defaultPropGetter,
    getColumnProps = defaultPropGetter,
    getRowProps = defaultPropGetter,
    getCellProps = defaultPropGetter,
    optionalSingleSelectionCallback
}) {

    const instance = useTable({
        data,
        columns
    }, usePagination);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        pageCount,
        page,
        state: { pageIndex, pageSize },
        gotoPage,
        previousPage,
        nextPage,
        canPreviousPage,
        canNextPage,
        setPageSize,
    } = instance;

    // console.log({ instance })

    function onRowSelect(e, item) {
        if (optionalSingleSelectionCallback) {
            optionalSingleSelectionCallback(item);
        }
    }

    return (<>
        {showPageHeader && <div className="padding-top-3">
            Showing <strong>{pageIndex * pageSize + 1} - {pageIndex * pageSize + page.length} of {data.length}</strong> {resourceType}
            {searchTerm && <span> for keyword <strong>&apos;{searchTerm}&apos;</strong> | <button className="usa-button usa-button--unstyled" onClick={clearSearch}>Clear search</button></span>}
        </div>}
        <table className="usa-table usa-table--borderless" width="100%" {...getTableProps()}>
            <thead>
                {headerGroups.map((headerGroup, i) => (

                    <tr key={`${i}-tr`} {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column, k) => (

                            <th key={`${k}-th`}
                                {...column.getHeaderProps([
                                    {
                                        style: { paddingLeft: 0, paddingRight: 0 }
                                    },
                                    {
                                        style: column.style,
                                        className: column.className
                                    },
                                    getColumnProps(column),
                                    getHeaderProps(column)])
                                }>
                                {column.render('Header')}
                            </th>

                        ))}
                    </tr>

                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {
                    (page && page.length > 0) ?
                        page.map(
                            (row, i) => {
                                prepareRow(row);
                                return (

                                    <tr onClick={(e) => onRowSelect(e, data[row.index])}
                                        key={`${i}-body-tr`} {...row.getRowProps(getRowProps(row))}>
                                        {row.cells.map((cell, cidx) => {
                                            return (

                                                <td key={`${i}-body-td`}
                                                    {...cell.getCellProps([
                                                        {
                                                            className: cidx > 0 ? "font-sans-3xs" : "",
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
        <div className="grid-col-12">
            <nav className="usa-pagination" role="navigation" aria-label="Pagination">
                <ol>
                    {canPreviousPage && <li className="previous-page"><button className="usa-button  usa-button--unstyled" onClick={previousPage}><i className="fa fa-angle-left"></i> Previous</button></li>}
                    {pageCount > 1 && Array(pageCount).fill('x').map((v, i) => <li key={i} className=""><button className={`usa-button  usa-button--unstyled ${pageIndex === i ? "is-active" : ""}`} aria-label={`page ${i + 1}`} onClick={() => gotoPage(i)}>{i + 1}</button></li>)}
                    {canNextPage ? <li className="next-page"><button className="usa-button  usa-button--unstyled" onClick={nextPage}>Next <i className="fa fa-angle-right"></i></button></li> : <li className="spacer"> </li>}
                </ol>
            </nav>
        </div>
        {/* <select
            value={pageSize}
            onChange={e => {
                setPageSize(Number(e.target.value))
            }}
        >
            {[1, 2, 3].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                </option>
            ))}
        </select> */}
    </>
    );
}
