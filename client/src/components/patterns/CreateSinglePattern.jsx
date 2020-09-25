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
import { useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import history from '../../history';

// import { createPattern, editPattern } from '../../actions/patterns';

import { Sequence, Step } from '../sequence';
import DefinePattern from './DefinePattern';
import AddComponents from './AddComponents';

export default function CreateSinglePattern(props) {
    // const dispatch = useDispatch();
    props.updateType && props.updateType();
    let { isPublished } = props;

    const selectedResults = useSelector((state) => state.searchResults.selectedComponents)
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

    // const [component] = props.components || '';

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
                    .required('Required'),
            })}
            onSubmit={(values) => {
                if (values.iriType === 'generated-iri')
                    values.iri = `${generatedIRIBase}${values.iri}`;

                if (selectedResults) {
                    let selectedValue = selectedResults[0] || {};

                    let pattern = {
                        ...values,
                        type: props.type || values.componenttype,
                        [props.type || values.componenttype]: { component: selectedValue, componentType: selectedValue.componentType },
                        primary: values.primaryorsecondary === "primary"
                    };
                    props.onSubmit(pattern);
                } else {
                    props.onSubmit(values)
                }
            }}
        >
            {(formprops) => (<>
                { !isPublished ?
                    <Sequence>
                        <div className="profile-form-frame">
                            <Form className="usa-form" style={{ maxWidth: 'inherit' }}>
                                <fieldset className="usa-fieldset">
                                    <Step title="Define Pattern">
                                        <DefinePattern {...formprops} isEditing={!!formprops.values.uuid} generatedIRIBase={generatedIRIBase} />
                                    </Step>
                                    <Step title="Add Component" button={<button className="usa-button" type="submit">Add to Profile</button>}>
                                        <AddComponents isOneComponentOnly={true} {...formprops} />
                                    </Step>
                                </fieldset>
                            </Form>
                        </div>
                    </Sequence>
                    :
                    <Form className="usa-form" style={{ maxWidth: 'inherit' }}>
                        <fieldset className="usa-fieldset">
                            <DefinePattern {...formprops} isEditing={!!formprops.values.uuid} isPublished={isPublished} />
                        </fieldset>
                        <button className="usa-button submit-button" type="submit" onClick={formprops.handleSubmit}>
                            Save Changes
                        </button>
                        <button className="usa-button usa-button--unstyled" type="reset" onClick={() => history.goBack()}><b>Cancel</b></button>
                    </Form>
                }
            </>)}
        </Formik>
    );
}