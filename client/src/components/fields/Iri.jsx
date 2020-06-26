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

export default function Iri(props) {
    return (<>
        {
            !props.initialValues.iri && <>
                <Field type="checkbox" id="hasIRI" name="hasIRI" className="usa-checkbox__input" />
                <label className="usa-checkbox__label" htmlFor="hasIRI">{props.message}</label>
                    </>
        }
        {
            (!props.initialValues.iri && props.values.hasIRI) ? (
                <ErrorValidation name="iri" type="input">
                    <label className="usa-label" htmlFor="iri"><span className="text-secondary">*</span> 
                        <span className="text-uppercase text-thin text-base font-sans-3xs"> IRI</span>
                    </label>
                    <Field name="iri" type="text" className="usa-input" id="iri" aria-required="true" />
                </ErrorValidation>
            ) : (props.initialValues.iri) ?
                <div>
                    <span className="text-uppercase text-thin text-base font-sans-3xs"> IRI</span><br />
                    <span>{props.values.iri}</span>
                </div> : ''
                
        }
    </>)
}
