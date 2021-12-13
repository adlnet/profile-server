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
import { Formik, Field } from 'formik';
import * as Yup from 'yup';

import Translations from '../../components/fields/Translations';
import Tags from '../../components/fields/Tags';
import ErrorValidation from '../controls/errorValidation';
import { Detail } from '../DetailComponents';
import { useSelector } from 'react-redux';
import CancelButton from '../controls/cancelButton';
import DeprecateButton from '../controls/deprecateButton';
import ValidationControlledSubmitButton from '../controls/validationControlledSubmitButton';
import DeleteButton from '../controls/DeleteButton';

export default function EditTemplateDetails({ initialValues, onSubmit, onCancel, isPublished, onDeprecate, onDelete }) {
    const currentProfileVersion = useSelector(state => state.application.selectedProfile);
    const generatedIRIBase = `${currentProfileVersion.iri}/templates/`;


    return (<>
        <div className="display-inline padding-right-5">
            <b>Edit Statement Template Details</b>
        </div>
        <span className="text-secondary">*</span><span className="usa-hint text-lowercase text-thin font-sans-3xs"> indicates required field</span>

        <Formik
            initialValues={initialValues || { name: '', description: '', 'more-information': '', tags: [], iriType: "external-iri", iri: '' }}
            validationSchema={Yup.object({
                name: Yup.string()
                    .required('Required'),
                description: Yup.string()
                    .required('Required')
            })}
            validateOnMount={true}
            onSubmit={(values) => {
                if (values.iriType === 'generated-iri')
                    values.iri = `${generatedIRIBase}${values.iri}`;
                onSubmit(values);
            }}
        >
            {(formikProps) => (
                <form className="usa-form" style={{ maxWidth: 'inherit' }}>
                    <fieldset className="usa-fieldset">
                        <Detail title='IRI' subtitle="The IRI used to identify this in an xAPI statement.">
                            {formikProps.values.iri}
                        </Detail>
                        {
                            isPublished ?
                                <Detail title='statement template name'>
                                    {formikProps.values.name}
                                </Detail>
                                :
                                <ErrorValidation name="name" type="input">
                                    <label className="usa-label text-uppercase text-thin font-sans-3xs" htmlFor="name"><span className="text-secondary">*</span><span className="details-label"> statement template name</span></label>
                                    <Field name="name" type="text" className="usa-input" id="input-name" aria-required="true" />
                                </ErrorValidation>
                        }
                        {
                            isPublished ?
                                <Detail title='description'>
                                    {formikProps.values.description}
                                </Detail>
                                :
                                <ErrorValidation name="description" type="input">
                                    <label className="usa-label text-uppercase text-thin font-sans-3xs" htmlFor="description"><span className="text-secondary">*</span><span className="details-label"> Description</span></label>
                                    <Field name="description" component="textarea" rows="3" className="usa-textarea" id="input-description" aria-required="true" />
                                </ErrorValidation>
                        }

                        <label className="usa-label text-uppercase text-thin font-sans-3xs" htmlFor="translations"><span className="details-label">Translations</span></label>
                        <Field name="translations" component={Translations} id="translations"></Field>

                        <label className="usa-label text-thin font-sans-3xs" htmlFor="tags">
                            <span className="text-uppercase"><span className="details-label">tags</span></span><br />
                            {!isPublished &&
                                <span className="usa-hint text-thin font-sans-3xs">Put a comma between each one. Example: <b>tag 1, tag 2, tag 3</b></span>
                            }
                        </label>
                        <Field name="tags" component={Tags} id="tags" isPublished={isPublished} />

                        <div className="grid-row">
                            <div className="grid-col-2">

                                <ValidationControlledSubmitButton errors={formikProps.errors} className="usa-button submit-button" style={{ margin: 0 }} type="button" onClick={formikProps.handleSubmit}>Save Changes</ValidationControlledSubmitButton>
                            </div>
                            <div className="grid-col">
                                <CancelButton className="usa-button usa-button--unstyled" style={{ marginLeft: "2em", marginTop: "0.6em" }} type="reset" cancelAction={onCancel} />
                            </div>
                            <div className="grid-col display-flex flex-column flex-align-end">
                                <DeprecateButton
                                    className="usa-button usa-button--unstyled text-secondary-dark text-bold"
                                    style={{ marginTop: "0.6em" }}
                                    type="reset"
                                    onClick={onDeprecate}
                                    componentType="statement template"
                                />
                                <DeleteButton
                                    className="usa-button usa-button--unstyled text-secondary-dark text-bold"
                                    style={{ marginTop: "0.6em" }}
                                    type="reset"
                                    onConfirm={onDelete}
                                    componentType="statement template"
                                />
                            </div>
                        </div>
                    </fieldset>
                </form>
            )}
        </Formik>
    </>);
}
