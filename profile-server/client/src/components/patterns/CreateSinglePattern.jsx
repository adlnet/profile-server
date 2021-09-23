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
import history from '../../history';

import { Sequence, Step } from '../sequence';
import DefinePattern from './DefinePattern';
import AddComponents from './AddComponents';
import CancelButton from '../controls/cancelButton';
import { isValidIRI } from '../fields/Iri';
import DeprecateButton from '../controls/deprecateButton';
import DeleteButton from '../controls/DeleteButton';

export default function CreateSinglePattern(props) {
    props.updateType && props.updateType();
    const { isPublished, root_url, onDelete } = props;

    const selectedResults = useSelector((state) => state.searchResults.selectedComponents)
    const currentProfileVersion = useSelector(state => state.application.selectedProfile);

    const generatedIRIBase = `${currentProfileVersion.iri}/patterns/`;

    const deleteButton = <DeleteButton
        className="usa-button usa-button--unstyled text-secondary-dark text-bold"
        style={{ marginTop: "0.6em" }}
        type="reset"
        onConfirm={onDelete}
        componentType="pattern"/>;

    let startingValues;
    if (props.pattern) {
        startingValues = { ...props.pattern };
        startingValues.primaryorsecondary = props.pattern.primary ? 'primary' : 'secondary';
        startingValues.componenttype = props.pattern.type;
        startingValues.component = props.components && props.components.component;
    }

    if (props.importedPattern) {
        startingValues = { ...props.importedPattern.model }
        startingValues.iriType = 'external-iri';
        startingValues.extiri = startingValues.iri;
        startingValues.geniri = '';
        startingValues.primaryorsecondary = startingValues.primary ? 'primary' : 'secondary';
        startingValues.componenttype = startingValues.type;
    }

    const formValidation = (values) => {
        const errors = {};
        if (!values.name) errors.name = 'Required';
        if (!values.description) errors.description = 'Required';

        if (!props.pattern || !props.pattern.iri) {
            if (values.iriType === 'external-iri') {
                if (!values.extiri.trim()) errors.extiri = 'Required';
                if (!isValidIRI(values.extiri)) errors.extiri = 'IRI did not match expected format.';
            } else {
                if (!values.geniri.trim()) errors.geniri = 'Required';
                const geniri = generatedIRIBase + values.geniri;
                if (!isValidIRI(geniri)) errors.geniri = 'IRI did not match expected format.';
            }
        }
        return errors;
    }

    function getCancelButton() {
        return <CancelButton className="usa-button usa-button--unstyled margin-left-4" cancelAction={() => history.push(root_url)} preventDefault={true} />
    }

    return (<>
        <Formik
            enableReinitialize={true}
            validateOnMount={true}
            initialValues={startingValues || {
                name: '',
                description: '',
                translations: [],
                tags: [],
                primaryorsecondary: 'primary',
                component: '',
                componenttype: '',
                iri: '',
                extiri: '',
                geniri: '',
                iriType: "external-iri",
            }}
            validate={formValidation}
            onSubmit={(values) => {
                if (!values.iri) {
                    values.iri = values.extiri.trim();
                    if (values.iriType === 'generated-iri')
                        values.iri = `${generatedIRIBase}${values.geniri.trim()}`;
                }
                if (selectedResults) {
                    let selectedValue = selectedResults[0];
                    console.log('selectedValue', selectedValue);
                    let pattern = {
                        ...values,
                        type: props.type || values.componenttype,
                        [props.type || values.componenttype]: selectedValue ? { component: selectedValue, componentType: selectedValue.componentType } : undefined,
                        primary: values.primaryorsecondary === "primary"
                    };
                    props.onSubmit(pattern);
                } else {
                    props.onSubmit(values)
                }
            }}
        >
            {(formprops) => (<>
                {!isPublished ?
                    <Sequence
                        isNotValidated={!!Object.keys(formprops.errors).length}
                    >
                        <div className="padding-x-2">
                            <Form className="usa-form" style={{ maxWidth: 'inherit' }}>
                                <fieldset className="usa-fieldset">
                                    <Step
                                        title="Define Pattern"
                                        isNotValidated={!!Object.keys(formprops.errors).length}
                                        cancel={getCancelButton()}
                                        deprecateButton={startingValues && <DeprecateButton className="usa-button usa-button--unstyled text-secondary-dark text-bold" style={{ marginTop: "1em" }} type="reset" onClick={props.onDeprecate} componentType="pattern" />}
                                        deleteButton={startingValues && deleteButton}
                                    >
                                        <DefinePattern {...formprops} isEditing={!!formprops.values.uuid} generatedIRIBase={generatedIRIBase} />
                                    </Step>
                                    <Step title="Add Component" button={<button className="usa-button" type="submit">Add to Profile</button>} cancel={getCancelButton()}>
                                        <AddComponents isOneComponentOnly={true} {...formprops} />
                                    </Step>
                                </fieldset>
                            </Form>
                        </div>
                    </Sequence>
                    :
                    <Form className="usa-form" style={{ maxWidth: 'inherit' }}>
                        <fieldset className="usa-fieldset">
                            <DefinePattern {...formprops} isEditing={!!formprops.values.uuid} isPublished={isPublished} generatedIRIBase={generatedIRIBase} />
                        </fieldset>
                        <div className="grid-row">
                            <div className="grid-col">

                                <button className="usa-button submit-button" type="submit" onClick={formprops.handleSubmit}>
                                    Save Changes
                                </button>
                                <CancelButton className="usa-button usa-button--unstyled" type="reset" cancelAction={() => history.push(root_url)} />
                            </div>
                            <div className="grid-col-3">
                                <div className="pin-right">
                                    <DeprecateButton className="usa-button usa-button--unstyled text-secondary-dark text-bold pin-right" style={{ marginTop: "1em", whiteSpace: "nowrap" }} type="reset" onClick={props.onDeprecate} componentType="pattern" />
                                    {deleteButton}
                                </div>
                            </div>
                        </div>
                    </Form>
                }
            </>)}
        </Formik>
    </>
    );
}