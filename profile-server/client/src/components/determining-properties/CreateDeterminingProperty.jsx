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
import React, { useState } from 'react';
import { Formik } from 'formik';
import { Link, useHistory } from 'react-router-dom';

import ChoosePropertyType from './ChoosePropertyType';
import AddProperty from './AddProperty';

export default function CreateDeterminingProperty({ onDeterminingPropertyAdd, breadcrumbs, checkConflict }) {

    const [step, setStep] = useState(1);
    const [propertyType, setPropertyType] = useState();
    const history = useHistory();

    const renderBreadcrumbs = () => {
        if (breadcrumbs) {
            return breadcrumbs.map((b, i) => (
                <span key={i}><Link to={b.to}><span className="breadcrumb">{b.crumb}</span></Link> <i className="fa fa-angle-right"></i> </span>
            ))
        }
        return <></>;
    }

    const oneConceptOnly = ['verb', 'objectActivityType'];

    return (<>
        <div className="grid-row">
            <div className="grid-col">
                <div className="margin-top-4">
                    {renderBreadcrumbs()}
                </div>
            </div>
        </div>
        <Formik
            initialValues={{ propertyType: '', properties: '' }}
            onSubmit={values => {
                onDeterminingPropertyAdd(values);
            }}
        >
            {({ handleSubmit, values, resetForm }) => (
                <form className="usa-form" style={{ maxWidth: "none" }}>
                    <div className={step !== 1 ? "display-none" : ""}>
                        <ChoosePropertyType
                            propertyType={propertyType}
                            onPropertyChange={propertyType => { checkConflict(propertyType, () => setPropertyType(propertyType), () => { setStep(1); resetForm() }) }}
                            setNextStep={() => { checkConflict(values.propertyType, () => setStep(2), () => setStep(1)) }}
                            onCancel={() => history.goBack()}
                        />
                    </div>
                    <div className={step !== 2 ? "display-none" : ""}>
                        <AddProperty
                            propertyType={propertyType}
                            setPreviousStep={() => history.goBack()}
                            isOneConceptOnly={oneConceptOnly.includes(propertyType)}
                            handleSubmit={handleSubmit}
                        />
                    </div>
                </form>
            )}
        </Formik>
    </>);
}
