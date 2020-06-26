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

import Iri from '../fields/Iri';
import ErrorValidation from '../controls/errorValidation';
import Translations from '../fields/Translations';

export default function BaseConceptFields(props) {
    return (
        <div>
            <Iri
                message="This concept already has an IRI that is used in xAPI statements"
                {...props}
            />
            <ErrorValidation name="name" type="input">
                <label className="usa-label" htmlFor="name"><span className="text-secondary">*</span>
                    <span className="details-label">concept name</span>
                </label>
                <Field name="name" type="text" className="usa-input" id="name" aria-required="true" />
            </ErrorValidation>
            
            <ErrorValidation name="description" type="input">
                <label className="usa-label" htmlFor="description"><span className="text-secondary">*</span>
                    <span className="details-label">description</span>
                </label>
                <Field name="description" component="textarea" rows="2" className="usa-textarea" id="description" aria-required="true" />
            </ErrorValidation>

            <label className="usa-label" htmlFor="translations"><span className="details-label">Translations</span></label>
            <Field name="translations" component={Translations} id="translations"></Field>
        </div>

    )
}
