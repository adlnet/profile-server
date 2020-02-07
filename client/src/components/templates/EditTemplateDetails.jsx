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
import { useHistory } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';

import { editTemplate  } from '../../actions/templates';
import { Translations } from '../../components/fields/Translations';
import Tags from '../../components/fields/Tags';

export default function EditTemplateDetails(props) {
    const dispatch = useDispatch();
    const history = useHistory();
    
    function handleCancel() {
        history.goBack();
    }

    return (<>
        <div className="display-inline padding-right-5">
            <b>Edit Statement Template Details</b>
        </div>
        <span className="text-secondary">*</span><span className="usa-hint text-lowercase text-thin font-sans-3xs"> indicates required field</span>

        <Formik
            initialValues={props.initialValues ? props.initialValues : {} || {}}
            validationSchema={Yup.object({
                name: Yup.string()
                    .required('Required'),
                description: Yup.string()
                    .required('Required')
            })}
            onSubmit={(values, { setSubmitting }) => {
                setSubmitting(true);
                dispatch(editTemplate(Object.assign({}, props.initialValues, values)));
                setSubmitting(false);
                history.goBack();
            }}
        >
            <Form className="usa-form"> {/*style={{maxWidth: 'inherit'}}>*/}
                <fieldset className="usa-fieldset">
                    <label className="usa-label text-uppercase text-thin font-sans-3xs" htmlFor="name"><span className="text-secondary">*</span> statement template name</label>
                    <Field name="name" type="text" className="usa-input" id="input-name" aria-required="true" />
                    <ErrorMessage name="name" />

                    <label className="usa-label text-uppercase text-thin font-sans-3xs" htmlFor="description"><span className="text-secondary">*</span> Description</label>
                    <Field name="description" component="textarea" rows="3" className="usa-textarea" id="input-description" aria-required="true" />
                    <ErrorMessage name="description" />

                    <label className="usa-label text-uppercase text-thin font-sans-3xs" htmlFor="translations">Translations</label>
                    <Field name="translations" component={Translations} id="translations"></Field>

                    <label className="usa-label text-thin font-sans-3xs" htmlFor="tags"> 
                        <span className="text-uppercase">tags</span><br />
                        <span className="usa-hint text-thin font-sans-3xs">Put a comma between each one. Example: <b>tag 1, tag 2, tag 3</b></span>
                    </label>                       
                    <Field name="tags" component={Tags} id="tags" />
                    

                    <button className="usa-button" type="submit">Save Changes</button>
                    <button className="usa-button usa-button--unstyled" type="reset" onClick={handleCancel}>Cancel</button>
                </fieldset>
            </Form>
        </Formik>
    </>);
}
