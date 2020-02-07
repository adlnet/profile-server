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
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

export default function CreateZeroOrMorePattern (props) {
    // const dispatch = useDispatch();
    props.updateType('Zero or More');

    return (
        <Formik
            initialValues={{ name: '', description: '', 'more-information': '', tags: '' }}
            validationSchema={Yup.object({
                name: Yup.string()
                    .max(15, 'Must be 20 characters or less')
                    .required('Required'),
                description: Yup.string()
                    .required('Required')
            })}
            onSubmit={() => {
                // dispatch(createPattern(values));
            }}
        >
            <Form className="usa-form"> {/*style={{maxWidth: 'inherit'}}>*/}
                <fieldset className="usa-fieldset">
                    <label className="usa-label" htmlFor="name"><span className="text-secondary">*</span> Name</label>
                    <Field name="name" type="text" className="usa-input" id="input-name" aria-required="true" />
                    <ErrorMessage name="name" />

                    <label className="usa-label" htmlFor="description"><span className="text-secondary">*</span> Description</label>
                    <Field name="description" component="textarea" rows="3" className="usa-textarea" id="input-description" aria-required="true" />
                    <ErrorMessage name="description" />

                    <button className="usa-button" type="submit">Create Pattern</button>  <button className="usa-button usa-button--unstyled" type="reset">Cancel</button>
                </fieldset>
            </Form>
        </Formik>
    );
}