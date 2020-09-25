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
import { useSelector, useDispatch } from "react-redux";
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import history from '../../history';

import { createPattern, editPattern } from '../../actions/patterns';
import { Sequence, Step } from '../../components/sequence';
import DefinePattern from './DefinePattern';
import AddComponents from './AddComponents';

export default function CreateAlternatePattern(props) {
    const dispatch = useDispatch();
    const { isPublished } = props;

    props.updateType && props.updateType('alternates');

    const selectedResults = useSelector((state) => state.searchResults.selectedComponents);
    const currentProfileVersion = useSelector(state => state.application.selectedProfile);

    const generatedIRIBase = `${currentProfileVersion.iri}/patterns/`;

    let startingValues;
    if (props.pattern) {
        // it's possible that the iri was external and still match, but this is what 
        // the system will use to generate the base of the concept iri, so we'll call it 
        // generated
        startingValues = { ...props.pattern };
        startingValues.primaryorsecondary = props.pattern.primary ? 'primary' : 'secondary';
        startingValues.componenttype = props.pattern.type;
        startingValues.iriType = props.pattern.iri.startsWith(generatedIRIBase) ? 'generated-iri' : 'external-iri'
        startingValues.iri = props.pattern.iri.replace(generatedIRIBase, "");
    }

    return (
        <Formik
            enableReinitialize={true}
            initialValues={startingValues || {
                name: '',
                description: '',
                translations: [],
                tags: [],
                primaryorsecondary: 'primary',
                component: '',
                componenttype: '',
                iri: '',
                iriType: "external-iri",
            }}
            validationSchema={Yup.object({
                name: Yup.string()
                    .required('Required'),
                description: Yup.string()
                    .required('Required'),
                iri: Yup.string()
                    .when('hasIRI', {
                        is: true,
                        then: Yup.string().required('Required'),
                    }),
            })}
            onSubmit={(values) => {
                if (values.iriType === 'generated-iri')
                    values.iri = `${generatedIRIBase}${values.iri}`;

                if (selectedResults) {
                    let pattern = {
                        ...values,
                        type: props.type || values.componenttype,
                        [props.type || values.componenttype]: selectedResults.map(res => ({ component: res, componentType: res.componentType })),
                        primary: values.primaryorsecondary === "primary"
                    };

                    props.onSubmit(pattern);
                } else {
                    props.onSubmit(values);
                }
            }}
        >
            {(props) => (<>
                { !isPublished ?
                    <Sequence>
                        <div className="profile-form-frame">
                            <Form className="usa-form" style={{ maxWidth: 'inherit' }}>
                                <fieldset className="usa-fieldset">
                                    <Step title="Define Pattern">
                                        <DefinePattern {...props} isEditing={!!props.values.uuid} generatedIRIBase={generatedIRIBase} />
                                    </Step>
                                    <Step title="Add Components" button={<button className="usa-button" type="submit" onClick={props.handleSubmit}>Add to Profile</button>}>
                                        <AddComponents isOneComponentOnly={false} pattern={props.pattern} {...props} />
                                    </Step>
                                </fieldset>
                            </Form>
                        </div>
                    </Sequence>
                    :
                    <Form className="usa-form" style={{ maxWidth: 'inherit' }}>
                        <fieldset className="usa-fieldset">
                            <DefinePattern {...props} isEditing={!!props.values.uuid} isPublished={isPublished} />
                        </fieldset>
                        <button className="usa-button submit-button" type="submit" onClick={props.handleSubmit}>
                            Save Changes
                        </button>
                        <button className="usa-button usa-button--unstyled" type="reset" onClick={() => history.goBack()}><b>Cancel</b></button>
                    </Form>
                }
            </>)}
        </Formik>
    );
}