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
import React, { useEffect } from 'react';
import { Formik, Form } from 'formik';
import { useHistory, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import AddProperty from './AddProperty';
import { selectTemplate } from '../../actions/templates';

export default function EditDeterminingProperty({ onDeterminingPropertyAdd }) {

    const { templateId, propertyType } = useParams();
    const history = useHistory();
    const dispatch = useDispatch();
    const oneConceptOnly = ['verb', 'objectActivityType'];
    const determiningProperties = useSelector(state => state.application.selectedDeterminingProperties);

    useEffect(() => {
        dispatch(selectTemplate(templateId))
    }, [templateId]);

    if (!determiningProperties) return '';
    const determiningProperty = determiningProperties.find(property => property.propertyType === propertyType);

    return (<>
        <Formik
            enableReinitialize={true}
            initialValues={{
                propertyType: (determiningProperty && determiningProperty.propertyType) || '',
                properties: (determiningProperty && determiningProperty.properties) || ''
            }}
            onSubmit={values => {
                onDeterminingPropertyAdd(values);
            }}
        >
            <Form className="usa-form" style={{ maxWidth: 'inherit' }}>
                <AddProperty
                    isEditing={true}
                    propertyType={determiningProperty.propertyType}
                    setPreviousStep={() => history.goBack()}
                    isOneConceptOnly={oneConceptOnly.includes(determiningProperty.propertyType)}
                />
            </Form>
        </Formik>
    </>
    );
}
