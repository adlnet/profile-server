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
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import { Sequence, Step } from '../../components/sequence';
import DefinePattern from './DefinePattern';
import AddComponents from './AddComponents';
import ArrangeOrder from './ArrangeOrder';

export default function CreateAlternatePattern(props) {
    // const dispatch = useDispatch();
    props.updateType('Alternate');

    return (
        <Formik
            initialValues={{ name: '', description: '', 'more-information': '', tags: '', primaryorsecondary: 'primary', choice: '1' }}
            validationSchema={Yup.object({
                name: Yup.string()
                    .max(15, 'Must be 20 characters or less')
                    .required('Required'),
                description: Yup.string()
                    .required('Required')
            })}
            onSubmit={(values) => {
                // dispatch(createPattern(values));
                console.log(values);
            }}
        >
            {() => (<>
                <Sequence>
                    <div className="profile-form-frame">
                        <Form className="usa-form" style={{ maxWidth: 'inherit' }}>
                            <fieldset className="usa-fieldset">
                                <Step title="Define Pattern">
                                    <DefinePattern />
                                </Step>
                                <Step title="Add Components">
                                    <AddComponents />
                                </Step>
                                <Step title="Arrange Order">
                                    <ArrangeOrder type="Alternate" />
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