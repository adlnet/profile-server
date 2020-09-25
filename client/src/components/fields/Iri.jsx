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
import React from 'react'
import { Field } from 'formik';

import ErrorValidation from '../controls/errorValidation';
import { Detail } from '../DetailComponents';

export default function Iri(props) {
    if (!props.values.iriType) return <oldIri {...props} />
    return (
        <>
            <div className="grid-row">
                <div className="usa-label">{!props.isPublished && <span className="text-secondary">*</span>}
                    <span className="text-uppercase text-thin text-base font-sans-3xs"> IRI</span>
                </div>
            </div>
            <div className="grid-row margin-top-1">
                <div className="grid-col text-base font-ui-2xs">
                    {props.sublabel}
                </div>
            </div>
            {
                props.isPublished ?
                    <div className="grid-row margin-bottom-3">{props.values && props.values.iri || "None provided"}</div>
                    :
                    <>
                        <div className="grid-row">
                            <div className="usa-radio" style={{ marginTop: "1em" }}>
                                <Field className="usa-radio__input" id="external-iri" type="radio" name="iriType" value="external-iri" />
                                <label className="usa-radio__label" htmlFor="external-iri">Use an external IRI</label>
                            </div>
                            <div className="usa-radio" style={{ marginTop: "1em", marginLeft: "2em" }}>
                                <Field className="usa-radio__input" id="generated-iri" type="radio" name="iriType" value="generated-iri" />
                                <label className="usa-radio__label" htmlFor="generated-iri">Use generated IRI</label>
                            </div>
                        </div>
                        <div className="grid-row">
                            {(props.values && props.values.iriType === "external-iri") ?
                                <ErrorValidation name="iri" type="input" style={{ width: "100%" }}>
                                    <label className="usa-label" htmlFor="iri" style={{ marginTop: "0" }}></label>
                                    <Field name="iri" type="text" className="usa-input" id="iri" aria-required="true" width="100%" />
                                </ErrorValidation>
                                :
                                !props.profileIRI || props.values.iri ?
                                    <ErrorValidation name="iri" type="input" style={{ width: "100%" }}>
                                        <div className="grid-row flex-wrap">

                                            <div className="grid-col flex-auto" style={{ alignItems: "center", display: "flex" }}>
                                                <div>
                                                    <span className="text-base font-ui-2xs">{props.generatedIRIBase}</span>
                                                </div>
                                            </div>

                                            <div className="grid-col" style={{ minWidth: "15em" }}>
                                                <label className="usa-label" htmlFor="iri" style={{ marginTop: "0" }}></label>
                                                <Field name="iri" type="text" className="usa-input" id="iri" aria-required="true" width="100%" />
                                            </div>

                                        </div>
                                    </ErrorValidation>
                                    : <div className="grid-row flex-wrap">

                                        <div className="grid-col flex-auto" style={{ alignItems: "center", display: "flex" }}>
                                            <div>
                                                <span className="text-base font-ui-2xs">{props.generatedIRIBase}</span>
                                            </div>
                                        </div>
                                    </div>

                            }
                        </div>
                    </>
            }
        </>)
}

function oldIri(props) {
    return (<>
        {
            !props.initialValues.iri && <>
                <Field type="checkbox" id="hasIRI" name="hasIRI" className="usa-checkbox__input" />
                <label className="usa-checkbox__label" htmlFor="hasIRI">{props.message}</label>
            </>
        }
        {
            (!props.isPublished && !props.initialValues.iri && props.values.hasIRI) ? (
                <ErrorValidation name="iri" type="input">
                    <label className="usa-label" htmlFor="iri"><span className="text-secondary">*</span>
                        <span className="text-uppercase text-thin text-base font-sans-3xs"> IRI</span>
                    </label>
                    <Field name="iri" type="text" className="usa-input" id="iri" aria-required="true" />
                </ErrorValidation>
            ) : (props.initialValues.iri) ?
                    <Detail title='IRI'>
                        {props.values.iri}
                    </Detail>
                    : ''

        }
    </>)
}
