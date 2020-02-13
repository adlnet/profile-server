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
import { useDispatch } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import { createPattern } from '../../actions/patterns';

import { Sequence, Step } from '../sequence';
import DefinePattern from './DefinePattern';
import AddComponent from './AddComponent';

export default function CreateSinglePattern(props) {
    const dispatch = useDispatch();
    props.updateType();

    return (
        <Formik
            initialValues={{
                name: '',
                description: '', 'more-information': '',
                tags: '',
                primaryorsecondary: 'primary',
                componentuuid: ''
            }}
            validationSchema={Yup.object({
                name: Yup.string()
                    .required('Required'),
                description: Yup.string()
                    .required('Required')
            })}
            onSubmit={(values, actions) => {
                let pattern = { ...values, type: props.type };
                pattern[props.type] = values.componentuuid;
                pattern.primary = values.primaryorsecondary === "primary";
                dispatch(createPattern(pattern));
                actions.setSubmitting(false);
            }}
        >
            {(props) => (<>
                <Sequence>
                    <div className="profile-form-frame">
                        <Form className="usa-form" style={{ maxWidth: 'inherit' }}>
                            <fieldset className="usa-fieldset">
                                <Step title="Define Pattern">
                                    <DefinePattern />
                                </Step>
                                <Step title="Add Component">
                                    <AddComponent {...props} />
                                </Step>
                            </fieldset>
                        </Form>
                    </div>
                    {/* <button className="usa-button" type="submit">Create Pattern</button>  <button className="usa-button usa-button--unstyled" type="reset">Cancel</button> */}
                </Sequence>
            </>)}
        </Formik>
    );
}