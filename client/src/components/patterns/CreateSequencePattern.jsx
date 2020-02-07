/** ***********************************************************************
*
* Veracity Technology Consultants 
* __________________
*
*  2019 Veracity Technology Consultants
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Veracity Technology Consultants and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Veracity Technology Consultants
* and its suppliers and may be covered by U.S. and Foreign Patents,
* patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Veracity Technology Consultants.
*/
import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import { Sequence, Step } from '../../components/sequence';
import DefinePattern from './DefinePattern';
import AddComponents from './AddComponents';
import ArrangeOrder from './ArrangeOrder';

export default function CreateSequencePattern(props) {
    // const dispatch = useDispatch();
    props.updateType('Sequence');

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
                                    <ArrangeOrder type="Sequence" />
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