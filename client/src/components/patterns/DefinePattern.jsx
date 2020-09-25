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
import { Field } from 'formik';

import Translations from '../../components/fields/Translations';
import TagsInput from '../../components/fields/Tags';
import ErrorValidation from '../controls/errorValidation';
import Iri from '../fields/Iri';
import { Detail } from '../DetailComponents';

export default function DefinePattern(props) {
    return (<>
        <div className="grid-row">
            <div className="grid-col-5"><h2 className="margin-bottom-05">Define Pattern Details</h2></div>
            <div className="grid-col">
                <div className="margin-top-3">
                    <span className="text-secondary">*</span> <span className="text-thin text-base font-sans-3xs">indicates required field</span>
                </div>
            </div>
        </div>
        <div className="margin-bottom-2"><span>Instructions</span></div>

        {/* <Iri message="This pattern already has an IRI that is used in xAPI statements" {...props} /> */}
        <Iri
            message="This concept already has an IRI that is used in xAPI statements"
            {...props} generatedIRIBase={props.generatedIRIBase} 
        />

        {
            props.isPublished ?
                <Detail title='pattern name'>
                    {props.values.name}
                </Detail>
                :
                <ErrorValidation name="name" type="input">
                    <label className="usa-label" htmlFor="name"><span className="text-secondary">*</span>
                        <span className="details-label">Pattern Name</span>
                    </label>
                    <Field name="name" type="text" className="usa-input" id="input-name" aria-required="true" />
                </ErrorValidation>
        }

        {
            props.isPublished ?
                <Detail title='description'>
                    {props.values.description}
                </Detail>
                :
                <ErrorValidation name="description" type="input">
                    <label className="usa-label" htmlFor="description"><span className="text-secondary">*</span>
                        <span className="details-label">Description</span>
                    </label>
                    <Field name="description" component="textarea" rows="2" className="usa-textarea" id="input-description" aria-required="true" />
                </ErrorValidation>
        }

        <label className="usa-label" htmlFor="translations"><span className="details-label">Translations</span></label>
        <Field name="translations" component={Translations} id="translations"></Field>


        <label className="usa-label">
            <span className="details-label">tags</span><br />
            {!props.isPublished &&
                <span className="usa-hint text-thin font-sans-3xs">Put a comma between each one. Example: <b>tag 1, tag 2, tag 3</b></span>
            }
            <Field name="tags" component={TagsInput} id="tags" isPublished={props.isPublished} />
        </label>
        {
            props.isPublished ?
                <Detail title='primary or secondary'>
                    {props.values.primaryorsecondary}
                </Detail>
                :
                <>
                    <label className="usa-label margin-bottom-2" ><span className="text-secondary">*</span> <span className="details-label">Primary or Secondary</span></label>
                    <div className="usa-radio">
                        <Field className="usa-radio__input"
                            type="radio"
                            name="primaryorsecondary"
                            id="primary"
                            value="primary"
                        />
                        <label className="usa-radio__label" htmlFor="primary">
                            <div className="title">Primary</div>
                            <div className="description">
                                Primary patterns define which combinations of statements have
                                meaning to a profile. A primary pattern cannot be pulled into
                                other patterns. Each statement received with this profile ID
                                will be checked for conformance to this pattern.
                                            </div>
                        </label>
                    </div>

                    <div className="usa-radio">
                        <Field className="usa-radio__input"
                            type="radio"
                            name="primaryorsecondary"
                            id="secondary"
                            value="secondary"
                        />
                        <label className="usa-radio__label" htmlFor="secondary">
                            <div className="title">Secondary</div>
                            <div className="description">
                                Contains only statement templates and may be pulled into a primary
                                pattern. Statements received which contain this profile ID will not
                                be checked for conformance to this pattern, unless it is pulled
                                into the primary pattern for this profile.
                                            </div>
                        </label>
                    </div>
                </>
        }
    </>)
}