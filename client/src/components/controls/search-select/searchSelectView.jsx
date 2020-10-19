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
import React, { useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import Truncate from 'react-truncate';

export function SearchSelectView({
    onSearchSubmit,
    // keywords,
    searchMessage,
    searchResults,
    selectedResults,
    isOneSelectionOnly,
    oneSelectionOnlyMessage,
    selectionMessage,
    isSelected,
    select,
    remove,
    resultView,
    placeholderText,
    filterOptions
}) {
    const [searchSubmited, setSearchSubmited] = useState(false);
    const [keywords, setKeywords] = useState();

    const filterInitValue = (filterOptions && filterOptions.length) ? filterOptions[0].value : ''

    return (
        <div className="border border-base-light margin-bottom-1" style={{ minHeight: "455px" }}>
            <div className="grid-row bg-base-lightest border-bottom-1px border-base-light">
                <div className="grid-col-11 padding-bottom-3 padding-left-3">
                    <div className="margin-y-1">{searchMessage}</div>

                    <Formik
                        initialValues={{ search: '', filter: filterInitValue }}
                        validationSchema={Yup.object({
                            search: Yup.string()
                                .required('Required')
                        })}
                        onSubmit={(values) => {
                            onSearchSubmit(values.search, values.filter);
                            setKeywords(values.search);
                            setSearchSubmited(true);
                        }}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            submitForm
                        }) => (
                                <Form>
                                    <div className="usa-search grid-row margin-top-2">
                                        {filterOptions &&
                                            <div className="grid-col-4 margin-right-2">
                                                <label className="usa-sr-only" htmlFor="filter">Filter</label>
                                                <select className="usa-select" name="filter" id="filter" style={{ marginTop: 0 }} defaultValue={values.filter} onChange={handleChange}>
                                                    {filterOptions.map((v, i) => <option key={i} value={v.value}>{v.option}</option>)}
                                                </select>
                                            </div>
                                        }
                                        <div role="search" className={`grid-col usa-form-group ${errors.search && touched.search ? "usa-form-group--error" : ""}`} style={{ marginTop: '0' }}>
                                            {
                                                errors.search && touched.search && (
                                                    <span className="usa-error-message padding-right-1" role="alert">{errors.search}</span>
                                                )
                                            }
                                            <label className="usa-sr-only" htmlFor="search-field">Search</label>
                                            <input className={`usa-input ${errors.search && touched.search ? "usa-input--error" : ""}`} id="search-field" type="search" name="search" style={{ padding: "1.2em" }}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                value={values.search}
                                                placeholder={placeholderText || ''} />
                                            <button className="usa-button" type="submit" onClick={submitForm} style={{ marginTop: 0, height: "auto" }} >
                                                <span className="usa-search__submit-text">Search</span>
                                            </button>
                                        </div>
                                    </div>
                                </Form>
                            )}
                    </Formik>
                </div>
            </div>
            <div className="grid-row" style={{ height: "455px", maxHeight: "455px" }}>
                <div className="grid-col-7 border-right-1px border-base-light padding-bottom-4 overflow-y-auto" style={{ maxHeight: 'inherit' }}>
                    <div className="grid-container" style={{ padding: "0 1rem" }}>
                        {
                            (searchResults && searchSubmited) && <>
                                <div className="grid-row border-bottom-1px position-sticky pin-top bg-white opacity-100" style={{ zIndex: '10' }}>
                                    <span className="margin-y-2">
                                        {`${searchResults.length > 0 ? searchResults.length : 'No'} results ${searchResults.length > 0 ? ' ' : 'found '}for `}<b>{`'${keywords}'`}</b>
                                    </span>
                                </div>
                                {
                                    searchResults.map((searchResult, key) => (
                                        React.cloneElement(
                                            resultView, { key: key, result: searchResult },
                                            (isSelected(searchResult)) ?
                                                <div className="usa-button usa-button--outline" type="button" style={{ margin: '0', minWidth: "105px" }}>Selected</div> :
                                                <button className="usa-button" type="button" style={{ margin: '0', minWidth: "105px" }} onClick={() => select(searchResult)}>Select</button>

                                        )
                                    ))}
                            </>
                        }
                    </div>
                </div>
                <div className="grid-col-5 padding-bottom-4 overflow-y-auto" style={{ maxHeight: 'inherit' }}>
                    <div className="grid-container" style={{ padding: "0 1rem" }}>
                        {
                            <>
                                {(selectedResults && selectedResults.length) ?
                                    <div className="grid-row border-bottom-1px position-sticky pin-top  bg-white opacity-100"  style={{ zIndex: '10' }}>
                                        <span className="margin-y-2"><b>{selectionMessage}</b></span>
                                    </div>
                                    : ''
                                }
                                {
                                    (selectedResults &&
                                        selectedResults.map((searchResult, key) => (
                                            React.cloneElement(
                                                resultView, { key: key, result: searchResult },
                                                <button className="usa-button" type="button" style={{ margin: '0' }} onClick={() => remove(searchResult)}>Remove</button>

                                            )
                                        )))
                                }
                                {isOneSelectionOnly &&
                                    <div className="grid-row">
                                        <span className="margin-y-2 font-sans-3xs text-base-light">
                                            <em>{oneSelectionOnlyMessage}</em>
                                        </span>
                                    </div>
                                }
                            </>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SearchSelectResultView({ result, resultName, resultDescription, subdescriptionView, onViewDetailsClick, children, currentProfileVersionId }) {
    return (
        <div className="grid-row border-bottom-1px padding-y-2 padding-x-1">
            <div className="grid-col-8">
                <span className="">{result && result[resultName]}</span><br />
                <span className="font-sans-3xs">
                    <Truncate lines={2}>
                        {result && result[resultDescription]}
                    </Truncate>
                </span><br /><br />
                <span className="font-sans-3xs text-base-light">
                    {React.cloneElement(subdescriptionView, { result: result, currentProfileVersionId: currentProfileVersionId })}
                </span>
            </div>
            <div className="grid-col-4">
                <div className="grid-row display-flex flex-row flex-align-center">
                    <div className="grid-col display-flex flex-column flex-align-end">
                        {children}
                        <button
                            type="button"
                            className="usa-button usa-button--unstyled"
                            style={{ marginTop: '.5em', marginRight: '.7em' }}
                            onClick={() => onViewDetailsClick(result)}
                        >
                            View Info
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
