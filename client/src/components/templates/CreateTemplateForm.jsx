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
import { Formik, Field, Form } from 'formik';
import { withRouter } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { createTemplate } from '../../actions/templates';
import Translations from '../../components/fields/Translations';
import Tags from '../../components/fields/Tags';
import ErrorValidation from '../controls/errorValidation';
import Iri, { isValidIRI } from '../fields/Iri';
import Breadcrumb from '../controls/breadcrumbs';
import CancelButton from '../controls/cancelButton';
import ValidationControlledSubmitButton from '../controls/validationControlledSubmitButton';

function CreateTemplateForm(props) {
    const dispatch = useDispatch();
    const location = useLocation();
    const history = useHistory();

    const currentProfileVersion = useSelector(state => state.application.selectedProfile);

    const generatedIRIBase = `${currentProfileVersion.iri}/templates/`;

    let importedTemplate = location.state && location.state.template ? { ...location.state.template } : null;

    if (importedTemplate) {
        importedTemplate.model.iriType = 'external-iri';
        importedTemplate.model.extiri = importedTemplate.model.iri;
        importedTemplate.model.geniri = '';
    }
    const formValidation = (values) => {
        const errors = {};
        if (!values.name) errors.name = 'Required';
        if (!values.description) errors.description = 'Required';
        if (values.iriType === 'external-iri') {
            if (!values.extiri.trim()) errors.extiri = 'Required';
            if (!isValidIRI(values.extiri)) errors.extiri = 'IRI did not match expected format.';
        } else {
            if (!values.geniri.trim()) errors.geniri = 'Required';
            const geniri = generatedIRIBase + values.geniri;
            if (!isValidIRI(geniri)) errors.geniri = 'IRI did not match expected format.';
        }
        return errors;
    }

    return (
        <div className="usa-layout-docs usa-layout-docs__main usa-prose">
            <header>
                <div className="grid-row">
                    <div className="grid-col margin-top-3">
                        <Breadcrumb breadcrumbs={[{ to: props.rootUrl, crumb: 'statement templates' }]} />
                        <h2 style={{ margin: "0 0 .5em 0" }}>Create Statement Template</h2>
                    </div>
                </div>
            </header>
            <div className="grid-row">
                A Statement Template describes one way statements following this profile may be structured.
            </div>
            <div className="grid-row margin-top-1">
                <label className="text-italic">
                    Once the statement template is created you will be able to add concepts, determining properties, and rules to it.
                </label>
            </div>

            <Formik
                initialValues={importedTemplate ? importedTemplate.model : { name: '', description: '', 'more-information': '', tags: [], iriType: "external-iri", iri: '', extiri: '', geniri: '' }}
                validate={formValidation}
                validateOnMount={true}
                onSubmit={(values) => {
                    values.iri = values.extiri.trim();
                    if (values.iriType === 'generated-iri')
                        values.iri = `${generatedIRIBase}${values.geniri.trim()}`;

                    if (importedTemplate) {
                        dispatch({ type: 'REMOVE_IMPORT_QUEUE_ITEM', payload: { type: 'templates', index: importedTemplate.index } });
                    }

                    dispatch(createTemplate(values));
                }}
            >
                {(formikProps) => (<>
                    <div className="grid-container border-1px border-base-lighter padding-4 margin-y-2">
                        <h2 className="display-inline padding-right-5">
                            Define Statement Template Details
                        </h2>
                        <span className="text-secondary">*</span><span className="usa-hint text-lowercase text-thin font-sans-3xs"> indicates required field</span>
                        <Form className="usa-form" style={{ maxWidth: "none" }}> {/*style={{maxWidth: 'inherit'}}>*/}
                            <fieldset className="usa-fieldset">
                                <Iri message="This statement template already has an IRI used in xAPI statments"
                                    sublabel={props.isPublished ? '' : <>The IRI is what you will use to identify this concept in xAPI statements. A portion of the IRI depends on the IRI for the profile.
                                    You may use an IRI that is managed externally or one that is generated by the profile server.
                                    <span className="text-bold"> This is permanent and cannot be changed.</span></>}
                                    {...formikProps} generatedIRIBase={generatedIRIBase} />

                                <ErrorValidation name="name" type="input">
                                    <label className="usa-label text-uppercase text-thin font-sans-3xs" htmlFor="name"><span className="text-secondary">*</span><span className="details-label"> statement template name</span></label>
                                    <Field name="name" type="text" className="usa-input" id="input-name" aria-required="true" />
                                </ErrorValidation>

                                <ErrorValidation name="description" type="input">
                                    <label className="usa-label text-uppercase text-thin font-sans-3xs" htmlFor="description"><span className="text-secondary">*</span><span className="details-label"> Description</span></label>
                                    <Field name="description" component="textarea" rows="3" className="usa-textarea" id="input-description" aria-required="true" />
                                </ErrorValidation>

                                <label className="usa-label text-uppercase text-thin font-sans-3xs" htmlFor="translations"><span className="details-label">Translations</span></label>
                                <Field name="translations" component={Translations} id="translations"></Field>

                                <label className="usa-label text-thin font-sans-3xs" htmlFor="tags">
                                    <span className="text-uppercase"><span className="details-label">tags</span></span><br />
                                    <span className="usa-hint text-thin font-sans-3xs">Put a comma between each one. Example: <b>tag 1, tag 2, tag 3</b></span>
                                </label>

                                <Field name="tags" component={Tags} id="tags" />
                            </fieldset>
                        </Form>
                    </div>
                    <ValidationControlledSubmitButton errors={formikProps.errors} className="usa-button submit-button" type="submit" onClick={formikProps.handleSubmit} >Create Statement Template</ValidationControlledSubmitButton>
                    <CancelButton className="usa-button usa-button--unstyled" type="reset" cancelAction={() => props.history.push(props.rootUrl)} />
                </>)}
            </Formik>
        </div>
    );
}

export default withRouter(CreateTemplateForm);
