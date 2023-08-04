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
import { validate } from 'jsonschema';
import iriSchema from './validation/validIRI';

import ErrorValidation from '../controls/errorValidation';
import { Detail } from '../DetailComponents';

export default function Iri(props) {
    const useAnExternalIRI = (props.values && props.values.iriType === "external-iri");

    return (
        <div>
            { props.isPublished ?
                <ReadOnlyView iri={props.values.iri} />
                : <>
                    <IRILabel sublabel={props.sublabel} isPublished={props.isPublished} profileIRI={props.profileIRI} labelPrefix={props.labelPrefix} />

                    <IRITypeRadioGroup />

                    <div className="grid-row">
                        {useAnExternalIRI ?
                            <ErrorValidation name="extiri" type="input" style={{ width: "100%", marginTop: "0" }}>
                                <label className="usa-label" htmlFor="extiri" style={{ marginTop: "0" }}></label>
                                <Field name="extiri" type="text" className="usa-input" id="extiri" aria-required="true" width="100%" />
                            </ErrorValidation>
                            :
                            props.profileIRI ?
                                <div className="grid-row flex-wrap" style={{ width: "100%" }}>
                                    <div className="grid-col" style={{ alignItems: "center", display: "flex" }}>
                                        <div className="padding-1 border bg-base-lightest margin-top-1" style={{ width: "100%" }}>
                                            <span className="">{props.generatedIRIBase}</span>
                                        </div>
                                    </div>
                                </div>
                                :
                                <ErrorValidation name="geniri" type="input" style={{ width: "100%", marginTop: "0" }}>
                                    <label className="usa-label" htmlFor="geniri" style={{ marginTop: "0" }}></label>
                                    <div className="grid-row flex-wrap">

                                        <div className="grid-col flex-auto" style={{ alignItems: "center", display: "flex" }}>
                                            <div>
                                                <span className="text-base font-ui-2xs">{props.generatedIRIBase}</span>
                                            </div>
                                        </div>

                                        <div className="grid-col" style={{ minWidth: "15em" }}>
                                            <Field name="geniri" type="text" className="usa-input" id="geniri" aria-required="true" width="100%" />
                                        </div>

                                    </div>
                                </ErrorValidation>
                        }
                    </div>
                </>
            }
        </div>)
}

function ReadOnlyView({ iri }) {
    return (
        <Detail title='IRI' subtitle="The IRI used to identify this in an xAPI statement.">
            {iri}
        </Detail>
    )
}

function IRILabel({ isPublished, sublabel, profileIRI, labelPrefix }) {
    return (<>
        <div className="grid-row">
            <div className="usa-label">{!(isPublished) && <span className="text-secondary">*</span>}
                <span className="text-uppercase text-thin text-base font-sans-3xs">{labelPrefix} IRI</span>
            </div>
        </div>
        {sublabel &&
            <div className="grid-row margin-top-1">
                <div className="grid-col text-base font-ui-2xs">
                    {sublabel}
                </div>
            </div>
        }
    </>)
}

function IRITypeRadioGroup() {
    return (<>
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
    </>)
}

export function isValidIRI(value) {
    try {
        validate({ iri: value }, iriSchema, { throwError: true });

        let isJS = value.startsWith("javascript:");
        if (isJS)
            return false;

        return true;
    } catch (e) {
        return false;
    }
}
