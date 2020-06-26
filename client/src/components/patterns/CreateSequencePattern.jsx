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
import ArrangeOrder from './ArrangeOrder';

export default function CreateSequencePattern(props) {
    const dispatch = useDispatch();

    props.updateType && props.updateType('sequence');

    const selectedResults = useSelector((state) => state.searchResults.selectedComponents);

    return (
        <Formik
            enableReinitialize={true}
            initialValues={{
                uuid: props.pattern && props.pattern.uuid || undefined,
                name: props.pattern && props.pattern.name || '',
                description: props.pattern && props.pattern.description || '',
                tags: props.pattern && props.pattern.tags || [],
                primaryorsecondary: props.pattern ? props.pattern.primary ? 'primary' : 'secondary' : 'primary',
                component: props.components && props.components.map(c => c.component) || [],
                componenttype: props.pattern && props.pattern.type || '',
                iri: props.pattern && props.pattern.iri || '',
                hasIRI: props.pattern && props.pattern.hasIRI || false
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
            onSubmit={(values, actions) => {
                let pattern = {
                    ...values,
                    type: props.type || values.componenttype,
                    [props.type || values.componenttype]: selectedResults.map(res => ({ component: res, componentType: res.componentType })),
                    primary: values.primaryorsecondary === "primary"
                };

                props.onSubmit(pattern);
                actions.setSubmitting(false);
            }}
        >
            {(props) => (<>
                <Sequence>
                    <div className="profile-form-frame">
                        <Form className="usa-form" style={{ maxWidth: 'inherit' }}>
                            <fieldset className="usa-fieldset">
                                <Step title="Define Pattern">
                                    <DefinePattern {...props} isEditing={!!props.values.uuid} />
                                </Step>
                                <Step title="Add Components">
                                    <AddComponents isOneComponentOnly={false} pattern={props.pattern} {...props} />
                                </Step>
                                <Step title="Arrange Order" button={<button className="usa-button" type="submit" onClick={props.handleSubmit}>Add to Profile</button>}>
                                    <ArrangeOrder type="Sequence" {...props} />
                                </Step>
                            </fieldset>
                        </Form>
                    </div>
                </Sequence>
            </>)}
        </Formik>
    );
}